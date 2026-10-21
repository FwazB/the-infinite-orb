use crate::{
    assets::{self, World},
    physics::{self, Input, STAGES, Simulation},
    render::Renderer,
};
use std::{cell::RefCell, collections::HashSet, rc::Rc};
use wasm_bindgen::{JsCast, prelude::*};
use web_sys::*;
struct Sound {
    context: AudioContext,
    gain: GainNode,
    analyser: AnalyserNode,
    source: AudioBufferSourceNode,
    samples: [f32; 256],
    enabled: bool,
}
impl Sound {
    fn new() -> Result<Self, JsValue> {
        let context = AudioContext::new()?;
        let count = context.sample_rate() as u32;
        let buffer = context.create_buffer(1, count, context.sample_rate())?;
        let mut data = vec![0.; count as usize];
        let mut seed = 713_u32;
        for v in &mut data {
            seed ^= seed << 13;
            seed ^= seed >> 17;
            seed ^= seed << 5;
            *v = seed as f32 / u32::MAX as f32 * 2. - 1.;
        }
        buffer.copy_to_channel(&data, 0)?;
        let source = context.create_buffer_source()?;
        source.set_buffer(Some(&buffer));
        source.set_loop(true);
        let filter = context.create_biquad_filter()?;
        filter.set_type(BiquadFilterType::Lowpass);
        filter.frequency().set_value(2200.);
        let gain = context.create_gain()?;
        gain.gain().set_value(0.);
        let analyser = context.create_analyser()?;
        analyser.set_fft_size(256);
        source.connect_with_audio_node(&filter)?;
        filter.connect_with_audio_node(&gain)?;
        gain.connect_with_audio_node(&analyser)?;
        analyser.connect_with_audio_node(&context.destination())?;
        source.start()?;
        let _ = context.resume();
        Ok(Self {
            context,
            gain,
            analyser,
            source,
            samples: [0.; 256],
            enabled: true,
        })
    }
    fn enabled(&mut self, on: bool) {
        self.enabled = on;
        if on {
            let _ = self.context.resume();
        } else {
            let _ = self.context.suspend();
        }
    }
    fn update(&mut self, power: f64, active: bool) -> f64 {
        let target = if self.enabled && active {
            0.07 * power.clamp(0., 1.).sqrt()
        } else {
            0.
        };
        let _ =
            self.gain
                .gain()
                .set_target_at_time(target as f32, self.context.current_time(), 0.015);
        if self.context.state() != AudioContextState::Running {
            return 0.;
        }
        self.analyser.get_float_time_domain_data(&mut self.samples);
        (self
            .samples
            .iter()
            .map(|v| (*v as f64).powi(2))
            .sum::<f64>()
            / 256.)
            .sqrt()
    }
}
impl Drop for Sound {
    fn drop(&mut self) {
        let _ = self
            .source
            .unchecked_ref::<AudioScheduledSourceNode>()
            .stop();
        let _ = self.context.close();
    }
}
struct App {
    doc: Document,
    canvas: HtmlCanvasElement,
    sim: Simulation,
    worlds: Vec<World>,
    view: Option<Renderer>,
    sound: Option<Sound>,
    mode: &'static str,
    keys: HashSet<String>,
    last: f64,
    disposed: bool,
    drag_id: Option<i32>,
    pointer: (i32, i32),
    touch: bool,
    pad: Vec<(i32, String)>,
    events: Vec<Closure<dyn FnMut(Event)>>,
}
impl App {
    fn element(&self, id: &str) -> Element {
        self.doc.get_element_by_id(id).expect("built-in UI element")
    }
    fn text(&self, id: &str, text: &str) {
        let e = self.element(id);
        if e.text_content().as_deref() != Some(text) {
            e.set_text_content(Some(text));
        }
    }
    fn html(&self, id: &str, text: &str) {
        self.element(id).set_inner_html(text);
    }
    fn attr(&self, id: &str, key: &str, value: impl ToString) {
        let _ = self.element(id).set_attribute(key, &value.to_string());
    }
    fn disabled(&self, id: &str, disabled: bool) {
        if disabled {
            self.attr(id, "disabled", "");
        } else {
            let _ = self.element(id).remove_attribute("disabled");
        }
    }
    fn checked(&self, id: &str) -> bool {
        self.element(id)
            .dyn_into::<HtmlInputElement>()
            .unwrap()
            .checked()
    }
    fn mode(&mut self, value: &'static str) {
        self.mode = value;
        let _ = self.doc.body().unwrap().set_attribute("data-mode", value);
    }
    /// Drop every held keyboard key and touch-pad press.
    fn release(&mut self) {
        self.keys.clear();
        self.pad.clear();
        if let Ok(list) = self.doc.query_selector_all(".touchpad [data-pressed]") {
            for i in 0..list.length() {
                if let Some(e) = list.item(i).and_then(|n| n.dyn_into::<Element>().ok()) {
                    let _ = e.remove_attribute("data-pressed");
                }
            }
        }
    }
    fn held(&self, code: &str) -> bool {
        self.keys.contains(code) || self.pad.iter().any(|(_, k)| k == code)
    }
    /// Pick the control label shown in hints for the active input method.
    fn label(&self, keyboard: &'static str, touch: &'static str) -> &'static str {
        if self.touch { touch } else { keyboard }
    }
    fn layout(&self) {
        let win = window().unwrap();
        let size = |v: Result<JsValue, JsValue>| v.ok().and_then(|v| v.as_f64()).unwrap_or(0.);
        let compact =
            self.touch || size(win.inner_width()) < 700. || size(win.inner_height()) <= 500.;
        let body = self.doc.body().unwrap();
        let _ = body.set_attribute("data-layout", if compact { "compact" } else { "wide" });
        let _ = body.set_attribute("data-input", if self.touch { "touch" } else { "keyboard" });
    }
    fn use_touch(&mut self) {
        if !self.touch {
            self.touch = true;
            self.layout();
            self.text(
                "support",
                "Touch or keyboard · gas-assisted scooter · no rider",
            );
        }
    }
    fn focus_canvas(&self) {
        let _ = self.canvas.focus();
    }
    fn instruments(&self) {
        let p = &self.sim.power;
        let spec = STAGES[p.stage];
        let next = STAGES.get(p.stage + 1);
        let starter = if p.starter_cooldown > 0. {
            format!("Cooling · {:.0}s", p.starter_cooldown.ceil())
        } else if p.stage > 0 {
            "Starter grants Stage I only".into()
        } else if p.starter_charge > 0. {
            format!("Charging · {:.0}%", p.starter_charge / 2. * 100.)
        } else {
            format!(
                "Hold {} 2s at rest → Stage I",
                self.label("E", "⚡\u{fe0e}")
            )
        };
        self.text("starter-hint", &starter);
        self.attr("starter-progress", "value", p.starter_charge / 2.);
        self.element("starter-progress")
            .dyn_into::<HtmlElement>()
            .unwrap()
            .set_hidden(p.stage > 0 || p.starter_cooldown > 0.);
        if self.sim.world == 3 {
            self.text(
                "world-summary",
                if p.stage == 0 {
                    self.label(
                        "Stock lift cannot overcome 100g · hold E to power up",
                        "Stock lift cannot overcome 100g · hold ⚡\u{fe0e} to power up",
                    )
                } else {
                    "Powertrain active · upgraded lift available"
                },
            );
        }
        self.text("stage", &format!("{} · ×{}", spec.name, spec.multiplier));
        self.attr("stage", "data-stage", p.stage);
        let hint = if p.slow > 0. {
            format!("Drop in {:.1}s · hold {} m/s", 4. - p.slow, spec.hold)
        } else if let Some(n) = next {
            format!(
                "Drive {} m/s for 1.5s · {:.0}%",
                n.enter,
                p.charge / 1.5 * 100.
            )
        } else {
            "Maximum stage · hold 15 m/s".into()
        };
        self.text("stage-hint", &hint);
        self.attr(
            "stage-progress",
            "value",
            if p.slow > 0. {
                1. - p.slow / 4.
            } else if next.is_some() {
                p.charge / 1.5
            } else {
                1.
            },
        );
        let velocity = (self.sim.state.speed + 0.5).floor() as i64;
        self.text(
            "speed",
            &format!(
                "{}{:02}",
                if velocity < 0 {
                    "-"
                } else if velocity > 0 {
                    "+"
                } else {
                    ""
                },
                velocity.abs()
            ),
        );
        self.attr("fuel", "data-value", format!("{:.3}", self.sim.state.fuel));
        for (id, value) in [
            ("altitude", self.sim.state.altitude),
            ("distance", self.sim.state.distance),
        ] {
            self.text(id, &format!("{:02.0}", value));
            self.attr(id, "data-value", format!("{value:.3}"));
        }
    }
    fn pause(&mut self) {
        if self.mode != "flying" {
            return;
        }
        self.release();
        self.sim.pause();
        if let Some(a) = &mut self.sound {
            a.update(0., false);
        }
        self.mode("paused");
        self.html("title", "A moment<br><em>of stillness.</em>");
        self.text(
            "description",
            "Your ride is paused. The little planet will be right here.",
        );
        self.html("launch", "Resume ride <span aria-hidden=\"true\">↗</span>");
        self.attr("launch", "aria-label", "Resume ride");
        self.disabled("pause", true);
        self.text("message", "Paused · your scooter is holding position");
        let _ = self
            .element("launch")
            .dyn_into::<HtmlElement>()
            .unwrap()
            .focus();
    }
    fn start(&mut self) {
        if self.view.is_none() || !["ready", "paused"].contains(&self.mode) {
            return;
        }
        self.release();
        self.sim.resume();
        self.mode("flying");
        self.disabled("pause", false);
        self.last = window().unwrap().performance().unwrap().now();
        self.focus_canvas();
        let text = self.label(
            "Hold W to ride. The road goes all the way around.",
            "Hold ▲ to ride. Drag the sky to look around.",
        );
        self.text("message", text);
    }
    fn reset(&mut self) {
        self.release();
        self.sim.reset();
        if let Some(a) = &mut self.sound {
            a.update(0., false);
        }
        if let Some(v) = &mut self.view {
            v.reset();
        }
        self.instruments();
        self.text("message", "Back at the start. Thruster fuel is unlimited.");
        if self.mode == "flying" {
            self.focus_canvas();
        }
    }
    fn fail(&mut self, text: &str) {
        self.release();
        self.sim.pause();
        if let Some(a) = &mut self.sound {
            a.update(0., false);
        }
        self.mode("error");
        self.text("message", text);
        self.html("title", "A small<br><em>detour.</em>");
        self.text("description", text);
        self.text("launch", "Reload scene");
        self.attr("launch", "aria-label", "Reload scene");
        self.disabled("launch", false);
        self.disabled("pause", true);
    }
    fn change_world(&mut self) {
        if self.view.is_none() || ["error", "unsupported"].contains(&self.mode) {
            return;
        }
        let id = self
            .element("destination")
            .dyn_into::<HtmlSelectElement>()
            .unwrap()
            .value();
        let Some(index) = self.worlds.iter().position(|w| w.id == id) else {
            return;
        };
        self.release();
        self.drag_id = None;
        if let Some(a) = &mut self.sound {
            a.update(0., false);
        }
        self.sim.change_world(index);
        if let Some(v) = &mut self.view {
            v.cockpit = false;
            v.reset();
        }
        self.mode("ready");
        let world = &self.worlds[index];
        self.disabled("pause", true);
        self.disabled("launch", false);
        self.text("launch", "Ride scooter");
        self.attr("launch", "aria-label", "Ride scooter");
        self.html("title", "Another world.<br><em>A different pull.</em>");
        self.text("description", &world.description);
        self.text(
            "gravity-badge",
            &format!(
                "{}G{}",
                world.gravity,
                if world.gravity_basis == "assumed" {
                    "*"
                } else {
                    ""
                }
            ),
        );
        self.text("gravity-note", &world.gravity_note);
        self.attr("gravity-note", "data-basis", &world.gravity_basis);
        self.text(
            "world-summary",
            if world.shape == "plateau" {
                self.label(
                    "Stock lift cannot overcome 100g · hold E to power up",
                    "Stock lift cannot overcome 100g · hold ⚡\u{fe0e} to power up",
                )
            } else {
                "Spherical miniature · stylized scale"
            },
        );
        self.text("gravity", &world.gravity.to_string());
        self.attr("gravity", "data-value", world.gravity);
        self.camera_label(false);
        self.instruments();
        self.text(
            "message",
            "Destination changed. Your ride is reset and paused.",
        );
    }
    fn camera_label(&self, cockpit: bool) {
        self.html(
            "camera",
            &format!(
                "View: {} <kbd>V</kbd>",
                if cockpit { "Cockpit" } else { "Planet" }
            ),
        );
        self.attr(
            "camera",
            "aria-label",
            if cockpit {
                "Switch to planet view"
            } else {
                "Switch to cockpit view"
            },
        );
        self.attr("camera", "aria-pressed", cockpit);
        let _ = self
            .doc
            .body()
            .unwrap()
            .set_attribute("data-camera", if cockpit { "cockpit" } else { "planet" });
    }
    fn toggle(&mut self) {
        if ["error", "unsupported"].contains(&self.mode) {
            return;
        }
        if let Some(v) = &mut self.view {
            v.toggle();
            let cockpit = v.cockpit;
            self.camera_label(cockpit);
            self.release();
            if self.mode == "flying" {
                self.focus_canvas();
            }
        }
    }
    fn handle(&mut self, kind: &str, event: Event) {
        match kind {
            "launch" => {
                if self.mode == "error" {
                    let _ = window().unwrap().location().reload();
                } else {
                    self.start();
                }
            }
            "pause" => self.pause(),
            "reset" => {
                event.prevent_default();
                self.reset();
            }
            "destination" => self.change_world(),
            "camera" => self.toggle(),
            "keydown" => {
                let e = event.dyn_into::<KeyboardEvent>().unwrap();
                if e.ctrl_key() || e.meta_key() || e.alt_key() {
                    return;
                }
                if e.target()
                    .and_then(|t| t.dyn_into::<Element>().ok())
                    .is_some_and(|t| {
                        t.closest("button,input,a,select,textarea")
                            .ok()
                            .flatten()
                            .is_some()
                    })
                {
                    return;
                }
                let code = e.code();
                if ["KeyP", "Escape"].contains(&code.as_str()) && self.mode == "flying" {
                    e.prevent_default();
                    self.pause();
                    return;
                }
                if code == "KeyV" && !e.repeat() && ["flying", "paused"].contains(&self.mode) {
                    e.prevent_default();
                    self.toggle();
                    return;
                }
                if code == "KeyR" && self.mode == "flying" {
                    e.prevent_default();
                    self.reset();
                    return;
                }
                if self.mode == "flying"
                    && [
                        "KeyW",
                        "KeyS",
                        "KeyA",
                        "KeyD",
                        "KeyE",
                        "Space",
                        "ShiftLeft",
                        "ShiftRight",
                        "ArrowUp",
                        "ArrowDown",
                        "ArrowLeft",
                        "ArrowRight",
                    ]
                    .contains(&code.as_str())
                {
                    e.prevent_default();
                    self.keys.insert(code);
                }
            }
            "keyup" => {
                self.keys
                    .remove(&event.dyn_into::<KeyboardEvent>().unwrap().code());
            }
            "blur" => self.pause(),
            "visibility" => {
                if self.doc.hidden() {
                    self.pause();
                }
            }
            "focus" => {
                let target = event.target().and_then(|t| t.dyn_into::<Element>().ok());
                let pad = target
                    .as_ref()
                    .is_some_and(|t| t.closest(".touchpad").ok().flatten().is_some());
                if !pad && target.is_none_or(|t| t.id() != "world") {
                    self.release();
                }
            }
            "resize" => self.layout(),
            "anypointer" => {
                if event
                    .dyn_ref::<PointerEvent>()
                    .is_some_and(|e| e.pointer_type() == "touch")
                {
                    self.use_touch();
                }
            }
            "pad-down" => {
                let e = event.dyn_into::<PointerEvent>().unwrap();
                e.prevent_default();
                if self.mode != "flying" {
                    return;
                }
                let Some(button) = e
                    .current_target()
                    .and_then(|t| t.dyn_into::<Element>().ok())
                else {
                    return;
                };
                let Some(code) = button.get_attribute("data-key") else {
                    return;
                };
                let _ = button.set_pointer_capture(e.pointer_id());
                let _ = button.set_attribute("data-pressed", "");
                self.pad.retain(|(id, _)| *id != e.pointer_id());
                self.pad.push((e.pointer_id(), code));
            }
            "pad-up" => {
                let e = event.dyn_into::<PointerEvent>().unwrap();
                let Some(button) = e
                    .current_target()
                    .and_then(|t| t.dyn_into::<Element>().ok())
                else {
                    return;
                };
                self.pad.retain(|(id, _)| *id != e.pointer_id());
                let code = button.get_attribute("data-key").unwrap_or_default();
                if !self.pad.iter().any(|(_, k)| *k == code) {
                    let _ = button.remove_attribute("data-pressed");
                }
            }
            "menu" => event.prevent_default(),
            "quality" => {
                let low = self.checked("quality");
                if let Some(v) = &mut self.view {
                    v.low = low;
                }
            }
            "sound" => {
                let enabled = self.checked("sound");
                if enabled && self.sound.is_none() {
                    match Sound::new() {
                        Ok(s) => self.sound = Some(s),
                        Err(_) => {
                            self.element("sound")
                                .dyn_into::<HtmlInputElement>()
                                .unwrap()
                                .set_checked(false);
                            self.text("message", "Audio is unavailable in this browser.");
                        }
                    }
                }
                if let Some(a) = &mut self.sound {
                    a.enabled(enabled);
                }
                if self.mode == "flying" {
                    self.focus_canvas();
                }
            }
            "pointerdown" => {
                if self.mode == "flying" && self.drag_id.is_none() {
                    let e = event.dyn_into::<PointerEvent>().unwrap();
                    self.drag_id = Some(e.pointer_id());
                    self.pointer = (e.client_x(), e.client_y());
                    let _ = self.canvas.set_pointer_capture(e.pointer_id());
                    self.focus_canvas();
                }
            }
            "pointermove" => {
                let e = event.dyn_into::<PointerEvent>().unwrap();
                if self.drag_id == Some(e.pointer_id()) && self.mode == "flying" {
                    if let Some(v) = &mut self.view {
                        v.orbit_by(
                            (e.client_x() - self.pointer.0) as f32,
                            (e.client_y() - self.pointer.1) as f32,
                        );
                    }
                    self.pointer = (e.client_x(), e.client_y());
                }
            }
            "pointerup" => {
                if event
                    .dyn_ref::<PointerEvent>()
                    .is_none_or(|e| self.drag_id == Some(e.pointer_id()))
                {
                    self.drag_id = None;
                }
            }
            "lost" => {
                event.prevent_default();
                self.fail("The graphics context was interrupted. Reload to return safely to the launch pad.");
            }
            "pagehide" => {
                if event
                    .dyn_ref::<PageTransitionEvent>()
                    .is_some_and(|e| e.persisted())
                {
                    self.pause();
                } else {
                    self.disposed = true;
                    self.sound.take();
                    self.view.take();
                }
            }
            _ => {}
        }
    }
    fn frame(&mut self, now: f64) {
        if self.disposed {
            return;
        }
        let dt = ((now - self.last) / 1000.).clamp(0., 0.1);
        self.last = now;
        if self.mode == "error" || self.doc.hidden() {
            return;
        }
        let held = |names: &[&str]| {
            if names.iter().any(|n| self.held(n)) {
                1.
            } else {
                0.
            }
        };
        let input = Input {
            power_up: self.held("KeyE"),
            thrust: held(&["KeyW", "ArrowUp"]) - held(&["KeyS", "ArrowDown"]),
            turn: held(&["KeyD", "ArrowRight"]) - held(&["KeyA", "ArrowLeft"]),
            lift: held(&["Space"]) - held(&["ShiftLeft", "ShiftRight"]),
        };
        self.sim.advance(dt, input);
        let reduced = self.checked("motion");
        if let Some(view) = &mut self.view {
            view.render(crate::render::RenderFrame {
                state: self.sim.state,
                previous: self.sim.previous,
                alpha: if self.sim.running {
                    self.sim.alpha()
                } else {
                    1.
                },
                dt,
                world: &self.worlds[self.sim.world],
                preview: ["ready", "paused"].contains(&self.mode),
                reduced,
                animate: self.mode == "flying",
                stage: self.sim.power.stage,
            });
        }
        self.instruments();
        let rms = if let Some(a) = &mut self.sound {
            a.update(
                self.sim.state.thrust
                    / (physics::MAX_THRUST * STAGES[self.sim.power.stage].multiplier),
                self.mode == "flying",
            )
        } else {
            0.
        };
        self.attr("world", "data-audio-rms", format!("{rms:.6}"));
        if self.mode == "flying" {
            self.text(
                "message",
                if self.sim.world == 3 {
                    if self.sim.power.stage == 0 {
                        self.label(
                            "100g training · hold E at rest to power up · release W and Space to charge",
                            "100g training · hold ⚡\u{fe0e} at rest to power up · release ▲ and LIFT to charge",
                        )
                    } else {
                        "100g training · staged lift active · keep moving to retain output"
                    }
                } else if self.sim.state.grounded {
                    self.label("W/S drive · A/D steer · Space lifts", "▲▼ drive · ◀▶ steer · LIFT rises")
                } else {
                    self.label(
                        "Release Space to fall · Shift cuts thrust · unlimited fuel",
                        "Release LIFT to fall · CUT stops thrust · unlimited fuel",
                    )
                },
            );
        }
    }
}
fn on(
    app: &Rc<RefCell<App>>,
    target: &EventTarget,
    name: &str,
    kind: &'static str,
) -> Result<(), JsValue> {
    let weak = Rc::downgrade(app);
    let cb = Closure::wrap(Box::new(move |e: Event| {
        if let Some(app) = weak.upgrade()
            && let Ok(mut app) = app.try_borrow_mut()
        {
            app.handle(kind, e);
        }
    }) as Box<dyn FnMut(Event)>);
    target.add_event_listener_with_callback(name, cb.as_ref().unchecked_ref())?;
    app.borrow_mut().events.push(cb);
    Ok(())
}
#[wasm_bindgen(start)]
pub fn start() -> Result<(), JsValue> {
    std::panic::set_hook(Box::new(|info| {
        web_sys::console::error_1(&info.to_string().into())
    }));
    let win = window().ok_or("No browser window")?;
    let doc = win.document().ok_or("No document")?;
    doc.get_element_by_id("app")
        .ok_or("Missing app root")?
        .set_inner_html(include_str!("../ui.html"));
    let canvas: HtmlCanvasElement = doc.get_element_by_id("world").unwrap().dyn_into()?;
    let worlds = assets::worlds();
    let destination = doc.get_element_by_id("destination").unwrap();
    for world in &worlds {
        let option = doc.create_element("option")?;
        option.set_attribute("value", &world.id)?;
        option.set_text_content(Some(&world.name));
        destination.append_child(&option)?;
    }
    let mut app = App {
        doc: doc.clone(),
        canvas: canvas.clone(),
        sim: Simulation::default(),
        worlds,
        view: None,
        sound: None,
        mode: "booting",
        keys: HashSet::new(),
        last: win.performance().unwrap().now(),
        disposed: false,
        drag_id: None,
        pointer: (0, 0),
        touch: win
            .match_media("(pointer: coarse)")?
            .is_some_and(|q| q.matches()),
        pad: vec![],
        events: vec![],
    };
    let reduced = win
        .match_media("(prefers-reduced-motion: reduce)")?
        .is_some_and(|q| q.matches());
    app.element("motion")
        .dyn_into::<HtmlInputElement>()?
        .set_checked(reduced);
    app.layout();
    if app.touch {
        app.text(
            "support",
            "Touch or keyboard · gas-assisted scooter · no rider",
        );
    }
    {
        match Renderer::new(canvas.clone()) {
            Ok(view) => {
                app.view = Some(view);
                app.disabled("destination", false);
                app.disabled("camera", false);
                app.mode("ready");
                app.disabled("launch", false);
                app.html("launch", "Ride scooter <span aria-hidden=\"true\">↗</span>");
                app.text("message", "Ready when you are.");
            }
            Err(e) => {
                web_sys::console::warn_1(&e);
                app.fail("This browser could not start the 3D scene. Enable hardware acceleration or try another browser.");
            }
        }
    }
    let app = Rc::new(RefCell::new(app));
    for (id, event, kind) in [
        ("launch", "click", "launch"),
        ("pause", "click", "pause"),
        ("reset", "click", "reset"),
        ("destination", "change", "destination"),
        ("camera", "click", "camera"),
        ("quality", "change", "quality"),
        ("sound", "change", "sound"),
    ] {
        let target: EventTarget = doc.get_element_by_id(id).unwrap().into();
        on(&app, &target, event, kind)?;
    }
    let wordmark: EventTarget = doc.query_selector(".wordmark")?.unwrap().into();
    on(&app, &wordmark, "click", "reset")?;
    for (event, kind) in [
        ("keydown", "keydown"),
        ("keyup", "keyup"),
        ("blur", "blur"),
        ("resize", "resize"),
        ("pagehide", "pagehide"),
    ] {
        on(&app, win.as_ref(), event, kind)?;
    }
    on(&app, win.as_ref(), "pointerdown", "anypointer")?;
    let pad = doc.query_selector_all(".touchpad button[data-key]")?;
    for i in 0..pad.length() {
        let button: EventTarget = pad.item(i).unwrap().into();
        for (event, kind) in [
            ("pointerdown", "pad-down"),
            ("pointerup", "pad-up"),
            ("pointercancel", "pad-up"),
            ("lostpointercapture", "pad-up"),
            ("contextmenu", "menu"),
        ] {
            on(&app, &button, event, kind)?;
        }
    }
    for (event, kind) in [("visibilitychange", "visibility"), ("focusin", "focus")] {
        on(&app, doc.as_ref(), event, kind)?;
    }
    for (event, kind) in [
        ("pointerdown", "pointerdown"),
        ("pointermove", "pointermove"),
        ("pointerup", "pointerup"),
        ("pointercancel", "pointerup"),
        ("webglcontextlost", "lost"),
    ] {
        on(&app, canvas.as_ref(), event, kind)?;
    }
    type AnimationCallback = Rc<RefCell<Option<Closure<dyn FnMut(f64)>>>>;
    let callback: AnimationCallback = Rc::new(RefCell::new(None));
    let next = callback.clone();
    *callback.borrow_mut() = Some(Closure::wrap(Box::new(move |now: f64| {
        if app.borrow().disposed {
            return;
        }
        app.borrow_mut().frame(now);
        if let Some(cb) = next.borrow().as_ref() {
            let _ = window()
                .unwrap()
                .request_animation_frame(cb.as_ref().unchecked_ref());
        }
    }) as Box<dyn FnMut(f64)>));
    win.request_animation_frame(callback.borrow().as_ref().unwrap().as_ref().unchecked_ref())?;
    Ok(())
}
