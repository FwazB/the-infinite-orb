use crate::{
    assets,
    physics::{FLOOR, MAX_THRUST, R, STAGES, State},
};
use glam::{Mat3, Mat4, Quat, Vec3, Vec4};
use wasm_bindgen::{JsCast, JsValue};
use web_sys::{
    HtmlCanvasElement, WebGl2RenderingContext as Gl, WebGlBuffer, WebGlProgram, WebGlShader,
    WebGlUniformLocation, WebGlVertexArrayObject,
};
const VS: &str = r#"#version 300 es
precision highp float;
layout(location=0) in vec3 position;
layout(location=1) in vec4 normal;
layout(location=2) in vec4 color;
uniform mat4 model;uniform mat4 vp;uniform float pointSize;
out vec3 n;out vec4 c;out float unlit;
void main(){gl_Position=vp*model*vec4(position,1.);gl_PointSize=pointSize;n=mat3(model)*normal.xyz;c=color;unlit=normal.w;}
"#;
const FS: &str = r#"#version 300 es
precision highp float;
in vec3 n;in vec4 c;in float unlit;uniform vec4 tint;out vec4 outColor;
void main(){float d=max(0.,dot(normalize(n),normalize(vec3(-25.,60.,40.))));float band=floor(d*3.99)/3.;float light=mix(.62+.60*band,1.,unlit);vec3 rgb=c.rgb*tint.rgb*light;outColor=vec4(pow(max(rgb,vec3(0.)),vec3(1./2.2)),c.a*tint.a);}
"#;
struct Mesh {
    name: String,
    flags: u32,
    vao: WebGlVertexArrayObject,
    vbo: WebGlBuffer,
    ebo: WebGlBuffer,
    count: i32,
}
struct Puff {
    p: Vec3,
    v: Vec3,
    age: f32,
}
pub struct RenderFrame<'a> {
    pub state: State,
    pub previous: State,
    pub alpha: f64,
    pub dt: f64,
    pub world: &'a assets::World,
    pub preview: bool,
    pub reduced: bool,
    pub animate: bool,
    pub stage: usize,
}
pub struct Renderer {
    gl: Gl,
    canvas: HtmlCanvasElement,
    program: WebGlProgram,
    meshes: Vec<Mesh>,
    model: Option<WebGlUniformLocation>,
    vp: Option<WebGlUniformLocation>,
    tint: Option<WebGlUniformLocation>,
    point_size: Option<WebGlUniformLocation>,
    pub cockpit: bool,
    pub low: bool,
    pub orbit: f32,
    pub orbit_height: f32,
    orbit_age: f32,
    camera_frame: Quat,
    snap: bool,
    intro_shift: f32,
    wheel: f32,
    clock: f32,
    puffs: Vec<Puff>,
    puff_clock: f32,
}
fn shader(gl: &Gl, kind: u32, source: &str) -> Result<WebGlShader, JsValue> {
    let s = gl.create_shader(kind).ok_or("Cannot allocate shader")?;
    gl.shader_source(&s, source);
    gl.compile_shader(&s);
    if !gl
        .get_shader_parameter(&s, Gl::COMPILE_STATUS)
        .as_bool()
        .unwrap_or(false)
    {
        return Err(gl.get_shader_info_log(&s).unwrap_or_default().into());
    }
    Ok(s)
}
pub fn color(hex: &str) -> Vec3 {
    let n = u32::from_str_radix(hex.trim_start_matches('#'), 16).unwrap_or(0);
    Vec3::new(
        ((n >> 16) & 255) as f32 / 255.,
        ((n >> 8) & 255) as f32 / 255.,
        (n & 255) as f32 / 255.,
    )
}
fn linear(n: u32) -> Vec4 {
    let c = color(&format!("{n:06x}"));
    Vec4::new(c.x.powf(2.2), c.y.powf(2.2), c.z.powf(2.2), 1.)
}
fn trs(p: Vec3, q: Quat, s: Vec3) -> Mat4 {
    Mat4::from_scale_rotation_translation(s, q, p)
}
fn attr(c: &HtmlCanvasElement, key: &str, v: impl ToString) {
    let _ = c.set_attribute(key, &v.to_string());
}
impl Renderer {
    pub fn new(canvas: HtmlCanvasElement) -> Result<Self, JsValue> {
        let gl: Gl = canvas
            .get_context("webgl2")?
            .ok_or("WebGL2 unavailable")?
            .dyn_into()?;
        let vertex = shader(&gl, Gl::VERTEX_SHADER, VS)?;
        let fragment = shader(&gl, Gl::FRAGMENT_SHADER, FS)?;
        let program = gl.create_program().ok_or("Cannot allocate program")?;
        gl.attach_shader(&program, &vertex);
        gl.attach_shader(&program, &fragment);
        gl.link_program(&program);
        gl.delete_shader(Some(&vertex));
        gl.delete_shader(Some(&fragment));
        if !gl
            .get_program_parameter(&program, Gl::LINK_STATUS)
            .as_bool()
            .unwrap_or(false)
        {
            return Err(gl.get_program_info_log(&program).unwrap_or_default().into());
        }
        let mut meshes = Vec::new();
        for data in assets::meshes().map_err(JsValue::from)? {
            let vao = gl.create_vertex_array().ok_or("VAO allocation failed")?;
            let vbo = gl.create_buffer().ok_or("Buffer allocation failed")?;
            let ebo = gl.create_buffer().ok_or("Buffer allocation failed")?;
            gl.bind_vertex_array(Some(&vao));
            gl.bind_buffer(Gl::ARRAY_BUFFER, Some(&vbo));
            gl.buffer_data_with_array_buffer_view(
                Gl::ARRAY_BUFFER,
                &js_sys::Float32Array::from(data.vertices.as_slice()),
                Gl::STATIC_DRAW,
            );
            for (index, size, offset) in [(0, 3, 0), (1, 4, 12), (2, 4, 28)] {
                gl.enable_vertex_attrib_array(index);
                gl.vertex_attrib_pointer_with_i32(index, size, Gl::FLOAT, false, 44, offset);
            }
            gl.bind_buffer(Gl::ELEMENT_ARRAY_BUFFER, Some(&ebo));
            gl.buffer_data_with_array_buffer_view(
                Gl::ELEMENT_ARRAY_BUFFER,
                &js_sys::Uint32Array::from(data.indices.as_slice()),
                Gl::STATIC_DRAW,
            );
            meshes.push(Mesh {
                name: data.name,
                flags: data.flags,
                vao,
                vbo,
                ebo,
                count: data.indices.len() as i32,
            });
        }
        gl.bind_vertex_array(None);
        gl.enable(Gl::DEPTH_TEST);
        gl.depth_func(Gl::LEQUAL);
        gl.blend_func(Gl::SRC_ALPHA, Gl::ONE_MINUS_SRC_ALPHA);
        let model = gl.get_uniform_location(&program, "model");
        let vp = gl.get_uniform_location(&program, "vp");
        let tint = gl.get_uniform_location(&program, "tint");
        let point_size = gl.get_uniform_location(&program, "pointSize");
        attr(&canvas, "data-engine", "rust-webassembly");
        attr(&canvas, "data-world", "tiny-planet");
        Ok(Self {
            gl,
            canvas,
            program,
            meshes,
            model,
            vp,
            tint,
            point_size,
            cockpit: false,
            low: false,
            orbit: 0.,
            orbit_height: 0.,
            orbit_age: 0.,
            camera_frame: Quat::IDENTITY,
            snap: true,
            intro_shift: 0.11,
            wheel: 0.,
            clock: 0.,
            puffs: vec![],
            puff_clock: 0.,
        })
    }
    pub fn reset(&mut self) {
        self.orbit = 0.;
        self.orbit_height = 0.;
        self.snap = true;
        self.wheel = 0.;
        self.puffs.clear();
        self.puff_clock = 0.;
    }
    pub fn toggle(&mut self) {
        self.cockpit = !self.cockpit;
        self.reset();
    }
    pub fn orbit_by(&mut self, dx: f32, dy: f32) {
        self.orbit += dx * 0.006;
        self.orbit_height = (self.orbit_height + dy * 0.003).clamp(-0.18, 0.4);
        self.orbit_age = 0.;
    }
    fn draw(&self, name: &str, model: Mat4, tint: Vec4, override_flags: Option<u32>) -> usize {
        let gl = &self.gl;
        let mut count = 0;
        for m in self.meshes.iter().filter(|m| m.name == name) {
            let flags = override_flags.unwrap_or(m.flags);
            if flags & 4 != 0 {
                gl.enable(Gl::BLEND);
                gl.depth_mask(false);
            } else {
                gl.disable(Gl::BLEND);
                gl.depth_mask(true);
            }
            if flags & 3 == 1 {
                gl.disable(Gl::CULL_FACE);
            } else {
                gl.enable(Gl::CULL_FACE);
                gl.cull_face(if flags & 3 == 2 { Gl::FRONT } else { Gl::BACK });
            }
            gl.uniform_matrix4fv_with_f32_array(self.model.as_ref(), false, &model.to_cols_array());
            gl.uniform4fv_with_f32_array(self.tint.as_ref(), &tint.to_array());
            gl.bind_vertex_array(Some(&m.vao));
            gl.draw_elements_with_i32(
                if flags & 8 != 0 {
                    Gl::POINTS
                } else {
                    Gl::TRIANGLES
                },
                m.count,
                Gl::UNSIGNED_INT,
                0,
            );
            count += 1;
        }
        count
    }
    pub fn render(&mut self, frame: RenderFrame<'_>) {
        let RenderFrame {
            state: s,
            previous,
            alpha,
            dt,
            world,
            preview,
            reduced,
            animate,
            stage,
        } = frame;
        let win = web_sys::window().unwrap();
        let width = win.inner_width().unwrap().as_f64().unwrap().max(1.) as f32;
        let height = win.inner_height().unwrap().as_f64().unwrap().max(1.) as f32;
        let ratio = if self.low {
            1.
        } else {
            win.device_pixel_ratio().min(1.5) as f32
        };
        let (w, h) = ((width * ratio) as u32, (height * ratio) as u32);
        if self.canvas.width() != w || self.canvas.height() != h {
            self.canvas.set_width(w);
            self.canvas.set_height(h);
        }
        self.gl.viewport(0, 0, w as i32, h as i32);
        let sky = color(&world.sky);
        self.gl.clear_color(sky.x, sky.y, sky.z, 1.);
        self.gl.depth_mask(true);
        self.gl.clear(Gl::COLOR_BUFFER_BIT | Gl::DEPTH_BUFFER_BIT);
        self.gl.use_program(Some(&self.program));
        let a = alpha as f32;
        let dt = dt as f32;
        let altitude = (previous.altitude + (s.altitude - previous.altitude) * alpha) as f32;
        let plateau = world.shape == "plateau";
        let mut position = previous
            .position()
            .as_vec3()
            .lerp(s.position().as_vec3(), a);
        let up = if plateau {
            Vec3::Y
        } else {
            position.normalize()
        };
        if !plateau {
            position = up * (R as f32 + FLOOR as f32 + altitude);
        }
        let mut forward = previous.forward().as_vec3().lerp(s.forward().as_vec3(), a);
        forward = (forward - up * forward.dot(up)).normalize();
        let right = forward.cross(up).normalize();
        let back = -forward;
        let frame = Quat::from_mat3(&Mat3::from_cols(right, up, back));
        let body = if reduced {
            frame
        } else {
            frame * Quat::from_rotation_z(s.bank as f32)
        };
        let bike = trs(position, body, Vec3::ONE);
        if animate {
            self.wheel = (self.wheel - s.speed as f32 * dt / 0.68) % std::f32::consts::TAU;
        }
        self.orbit_age += dt;
        if self.orbit_age > 2. {
            self.orbit *= (-dt * 2.).exp();
            self.orbit_height *= (-dt * 2.).exp();
        }
        let blend = 1. - (-dt * if reduced { 16. } else { 6. }).exp();
        if self.snap {
            self.camera_frame = frame;
            self.snap = false;
        } else {
            self.camera_frame = self.camera_frame.slerp(frame, blend);
        }
        let framed = altitude + if plateau { 20. } else { 0. };
        let extent = R as f32 + FLOOR as f32 + framed + 5.;
        let distance = (2. * extent).max(75.);
        let far = (4. * extent).max(400.);
        let aspect = width / height;
        let span = 27_f32.max(R as f32 + framed.max(0.) + 4.);
        let hh = span.max(span / aspect);
        let hw = hh * aspect;
        self.intro_shift +=
            (if preview && aspect > 1.5 { 0.11 } else { 0. } - self.intro_shift) * blend;
        let eye = self.camera_frame
            * (Vec3::new(
                (0.38 + self.orbit).sin() * 0.75,
                0.68 + self.orbit_height,
                (0.38 + self.orbit).cos() * 0.75,
            )
            .normalize()
                * distance);
        let mut projection =
            glam::camera::rh::proj::opengl::orthographic(-hw, hw, -hh, hh, 0.1, far);
        projection.w_axis.x += 2. * self.intro_shift;
        let overview = projection
            * glam::camera::rh::view::look_at_mat4(
                eye,
                if plateau {
                    Vec3::new(0., 8., 0.)
                } else {
                    Vec3::ZERO
                },
                self.camera_frame * Vec3::Y,
            );
        let vp = if self.cockpit {
            let eye = position + frame * Vec3::new(0., 1.3, -0.25);
            let yaw = self.orbit.clamp(-0.85, 0.85);
            let pitch = -0.38 - self.orbit_height;
            let target = eye
                + frame
                    * Vec3::new(
                        yaw.sin() * pitch.cos(),
                        pitch.sin(),
                        -yaw.cos() * pitch.cos(),
                    );
            glam::camera::rh::proj::opengl::perspective(80_f32.to_radians(), aspect, 0.025, far)
                * glam::camera::rh::view::look_at_mat4(eye, target, up)
        } else {
            overview
        };
        self.gl
            .uniform_matrix4fv_with_f32_array(self.vp.as_ref(), false, &vp.to_cols_array());
        self.gl.uniform1f(self.point_size.as_ref(), 2.5 * ratio);
        let mut calls = self.draw(
            &format!("world:{}", world.id),
            Mat4::IDENTITY,
            Vec4::ONE,
            None,
        );
        let shadow_position = if plateau {
            Vec3::new(s.x as f32, R as f32 + 0.11, s.z as f32)
        } else {
            up * (R as f32 + 0.11)
        };
        if !plateau || (s.x.abs() <= 14. && s.z.abs() <= 14. && s.y >= R) {
            let mut tint = linear(0x433458);
            tint.w = 0.22 / (1. + altitude * 0.35);
            calls += self.draw(
                "fx:shadow",
                trs(
                    shadow_position,
                    frame * Quat::from_rotation_x(-std::f32::consts::FRAC_PI_2),
                    Vec3::new(1. + altitude * 0.06, 1.7 + altitude * 0.06, 1.),
                ),
                tint,
                None,
            );
        }
        calls += self.draw("bike:body", bike, Vec4::ONE, None);
        for (i, z) in [1.05, -1.03].iter().enumerate() {
            calls += self.draw(
                &format!("bike:wheel{i}"),
                bike * trs(
                    Vec3::new(0., -0.18, *z),
                    Quat::from_rotation_x(self.wheel),
                    Vec3::ONE,
                ),
                Vec4::ONE,
                None,
            );
        }
        if !self.cockpit {
            calls += self.draw("bike:arch", bike, Vec4::ONE, None);
        }
        calls += self.draw(
            "bike:glass",
            bike,
            Vec4::new(1., 1., 1., if self.cockpit { 0.12 / 0.68 } else { 1. }),
            None,
        );
        if animate && !reduced {
            self.clock += dt.clamp(0., 0.1);
        }
        if stage > 0 && !self.cockpit {
            let pulse = (if reduced {
                1.
            } else {
                1. + 0.025 * (self.clock * 2.).sin()
            }) * (1. + stage as f32 * 0.04);
            let root = trs(position, frame, Vec3::splat(pulse));
            let mut tint = linear(STAGES[stage].color);
            tint.w = 0.08 + stage as f32 * 0.035;
            calls += self.draw(
                "fx:sphere",
                root * trs(
                    Vec3::new(0., 0.85, 0.),
                    Quat::IDENTITY,
                    Vec3::new(1.7, 2., 3.1),
                ),
                tint,
                Some(6),
            );
            tint.w = 0.6;
            for i in 0..stage {
                let i = i as f32;
                let angle = i * 0.7
                    + if reduced {
                        0.
                    } else {
                        self.clock * 0.18 * if i as i32 % 2 != 0 { -1. } else { 1. }
                    };
                calls += self.draw(
                    "fx:torus",
                    root * trs(
                        Vec3::new(0., 0.7 + i * 0.3, 0.),
                        Quat::from_euler(
                            glam::EulerRot::XYZ,
                            std::f32::consts::FRAC_PI_2,
                            i * 0.35,
                            angle,
                        ),
                        Vec3::new(1.7, 3.1, 1.),
                    ),
                    tint,
                    None,
                );
            }
        }
        if reduced {
            self.puffs.clear();
        } else {
            let step = if animate { dt } else { 0. };
            for p in &mut self.puffs {
                p.age += step;
                p.p += p.v * step;
            }
            self.puffs.retain(|p| p.age < 0.85);
            self.puff_clock += step;
            if animate && s.thrust / MAX_THRUST > 0.001 && self.puff_clock > 1. / 25. {
                self.puff_clock = 0.;
                for side in [-1., 1.] {
                    if self.puffs.len() < 32 {
                        self.puffs.push(Puff {
                            p: position - up * 0.42 + right * (side * 0.62) + back * 0.35,
                            v: s.velocity().as_vec3() - up * 4. + right * (side * 0.7),
                            age: 0.,
                        });
                    }
                }
            }
            for p in &self.puffs {
                let size = (0.18 + p.age * 0.9) * ((0.85 - p.age) / 0.25).min(1.);
                for lobe in 0..3 {
                    let center = p.p
                        + right * ((lobe as f32 - 1.) * size * 0.75)
                        + back * (if lobe == 1 { 0.35 } else { -0.15 } * size);
                    let mut tint = linear(0xf8f7f1);
                    tint.w = 0.42;
                    calls += self.draw(
                        "fx:cloud",
                        trs(
                            center,
                            Quat::IDENTITY,
                            Vec3::splat(size * if lobe == 1 { 1. } else { 0.75 }),
                        ),
                        tint,
                        None,
                    );
                }
            }
        }
        self.gl.depth_mask(true);
        self.gl.bind_vertex_array(None);
        let center = overview.project_point3(Vec3::ZERO);
        let projected = overview.project_point3(position);
        attr(
            &self.canvas,
            "data-camera",
            if self.cockpit { "cockpit" } else { "planet" },
        );
        attr(&self.canvas, "data-destination", &world.id);
        attr(&self.canvas, "data-shape", &world.shape);
        attr(
            &self.canvas,
            "data-planet-in-frame",
            !self.cockpit
                && center.x.abs() + R as f32 / hw < 1.
                && center.y.abs() + R as f32 / hh < 1.,
        );
        attr(
            &self.canvas,
            "data-scooter-in-frame",
            !self.cockpit
                && projected.x.abs() + 2. / hw < 1.
                && projected.y.abs() + 2. / hh < 1.
                && projected.z.abs() < 1.,
        );
        attr(
            &self.canvas,
            "data-aura",
            if self.cockpit { 0 } else { stage },
        );
        attr(&self.canvas, "data-plumes", self.puffs.len() * 3);
        attr(&self.canvas, "data-draw-calls", calls);
    }
}
impl Drop for Renderer {
    fn drop(&mut self) {
        for m in &self.meshes {
            self.gl.delete_buffer(Some(&m.vbo));
            self.gl.delete_buffer(Some(&m.ebo));
            self.gl.delete_vertex_array(Some(&m.vao));
        }
        self.gl.delete_program(Some(&self.program));
    }
}
