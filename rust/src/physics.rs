use glam::DVec3 as V;
use serde::{Deserialize, Serialize};
pub const R: f64 = 18.;
pub const FLOOR: f64 = 0.86;
pub const CONTACT: f64 = R + FLOOR;
pub const G: f64 = 9.80665;
pub const MASS: f64 = 300.;
pub const FUEL: f64 = 80.;
pub const MAX_THRUST: f64 = 45000.;
#[derive(Clone, Copy, Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Input {
    pub thrust: f64,
    pub turn: f64,
    pub lift: f64,
    #[serde(default)]
    pub power_up: bool,
}
#[derive(Clone, Copy, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct State {
    pub x: f64,
    pub y: f64,
    pub z: f64,
    pub fx: f64,
    pub fy: f64,
    pub fz: f64,
    pub speed: f64,
    pub vy: f64,
    pub altitude: f64,
    pub bank: f64,
    pub distance: f64,
    pub grounded: bool,
    pub velocity_x: f64,
    pub velocity_y: f64,
    pub velocity_z: f64,
    pub fuel: f64,
    pub thrust: f64,
}
impl Default for State {
    fn default() -> Self {
        Self {
            x: 0.,
            y: CONTACT,
            z: 0.,
            fx: 0.,
            fy: 0.,
            fz: -1.,
            speed: 0.,
            vy: 0.,
            altitude: 0.,
            bank: 0.,
            distance: 0.,
            grounded: true,
            velocity_x: 0.,
            velocity_y: 0.,
            velocity_z: 0.,
            fuel: FUEL,
            thrust: 0.,
        }
    }
}
impl State {
    pub fn position(&self) -> V {
        V::new(self.x, self.y, self.z)
    }
    pub fn forward(&self) -> V {
        V::new(self.fx, self.fy, self.fz)
    }
    pub fn velocity(&self) -> V {
        V::new(self.velocity_x, self.velocity_y, self.velocity_z)
    }
    fn set_position(&mut self, v: V) {
        self.x = v.x;
        self.y = v.y;
        self.z = v.z;
    }
    fn set_forward(&mut self, v: V) {
        self.fx = v.x;
        self.fy = v.y;
        self.fz = v.z;
    }
    fn set_velocity(&mut self, v: V) {
        self.velocity_x = v.x;
        self.velocity_y = v.y;
        self.velocity_z = v.z;
    }
    fn finite(&self) -> bool {
        [
            self.x,
            self.y,
            self.z,
            self.fx,
            self.fy,
            self.fz,
            self.speed,
            self.vy,
            self.altitude,
            self.bank,
            self.distance,
            self.velocity_x,
            self.velocity_y,
            self.velocity_z,
            self.fuel,
            self.thrust,
        ]
        .iter()
        .all(|v| v.is_finite())
    }
}
#[derive(Clone, Copy)]
pub struct Stage {
    pub name: &'static str,
    pub multiplier: f64,
    pub enter: f64,
    pub hold: f64,
    pub road: f64,
    pub lift: f64,
    pub color: u32,
}
pub const STAGES: [Stage; 4] = [
    Stage {
        name: "Stock",
        multiplier: 1.,
        enter: 0.,
        hold: 0.,
        road: 8.,
        lift: 5.,
        color: 0xcddce1,
    },
    Stage {
        name: "Stage I",
        multiplier: 50.,
        enter: 6.,
        hold: 4.,
        road: 16.,
        lift: 10.,
        color: 0xffd866,
    },
    Stage {
        name: "Stage II",
        multiplier: 100.,
        enter: 12.,
        hold: 8.,
        road: 28.,
        lift: 16.,
        color: 0xffab46,
    },
    Stage {
        name: "Stage III",
        multiplier: 400.,
        enter: 22.,
        hold: 15.,
        road: 38.,
        lift: 24.,
        color: 0xfff2ba,
    },
];
#[derive(Clone, Copy, Default, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Powertrain {
    pub stage: usize,
    pub starter_charge: f64,
    pub starter_cooldown: f64,
    pub charge: f64,
    pub slow: f64,
}
impl Powertrain {
    pub fn clear_timers(&mut self) {
        self.charge = 0.;
        self.slow = 0.;
    }
    pub fn starter(&mut self, held: bool, stationary: bool, dt: f64) {
        if !dt.is_finite() || dt <= 0. {
            return;
        }
        self.starter_cooldown = (self.starter_cooldown - dt).max(0.);
        if !held || !stationary || self.stage != 0 || self.starter_cooldown > 0. {
            self.starter_charge = 0.;
            return;
        }
        self.starter_charge += dt;
        if self.starter_charge + 1e-9 >= 2. {
            self.stage = 1;
            self.clear_timers();
            self.starter_charge = 0.;
            self.starter_cooldown = 12.;
        }
    }
    pub fn advance(&mut self, speed: f64, dt: f64, can_charge: bool) {
        if !speed.is_finite() || !dt.is_finite() || dt <= 0. {
            return;
        }
        let next = STAGES.get(self.stage + 1);
        let velocity = speed.max(0.);
        self.charge = if can_charge && next.is_some_and(|n| velocity >= n.enter) {
            self.charge + dt
        } else {
            0.
        };
        self.slow = if self.stage > 0 && velocity < STAGES[self.stage].hold {
            self.slow + dt
        } else {
            0.
        };
        if self.slow + 1e-9 >= 4. {
            self.stage -= 1;
            self.clear_timers();
        } else if next.is_some() && self.charge + 1e-9 >= 1.5 {
            self.stage += 1;
            self.clear_timers();
        }
    }
}
fn spec(stage: usize) -> Stage {
    *STAGES.get(stage).unwrap_or(&STAGES[0])
}
fn sign(v: f64) -> f64 {
    if v > 0. {
        1.
    } else if v < 0. {
        -1.
    } else {
        0.
    }
}
pub fn drive_speed(
    speed: f64,
    throttle: f64,
    mass: f64,
    normal: f64,
    dt: f64,
    stage: usize,
) -> f64 {
    let s = spec(stage);
    let support = normal.max(0.);
    let target = if throttle >= 0. {
        s.road * throttle
    } else {
        3. * throttle
    };
    let direction = sign(if speed != 0. { speed } else { throttle });
    let rolling = 0.02 * support;
    let drag = 0.4 * speed * speed;
    let braking = throttle != 0. && speed * throttle < 0.;
    let grip = 0.7 * support;
    let limit = if braking {
        3000_f64.min(grip)
    } else {
        (3000. * s.multiplier)
            .min(24000. * s.multiplier / speed.abs().max(1.))
            .min(grip)
    };
    let wanted = if throttle == 0. {
        0.
    } else {
        mass * (target - speed) * 4. + direction * (rolling + drag)
    };
    let motor = wanted.clamp(-limit, limit);
    let resistance = direction
        * if speed.abs() < 1e-6 {
            (rolling + drag).min(motor.abs())
        } else {
            rolling + drag
        };
    let result = speed + (motor - resistance) / mass * dt;
    if sign(result) != sign(speed) && speed != 0. {
        0.
    } else {
        result
    }
}
pub fn gravity_at(radius: f64, multiplier: f64) -> f64 {
    G * multiplier * R * R / (radius * radius)
}
pub fn thrust(request: f64, dt: f64, multiplier: f64) -> f64 {
    let cap = MAX_THRUST
        * if multiplier.is_finite() {
            multiplier.clamp(1., 400.)
        } else {
            1.
        };
    if request.is_finite() && dt.is_finite() && dt > 0. {
        request.clamp(0., cap)
    } else {
        0.
    }
}
pub fn ballistic(p: V, v: V, external: V, dt: f64, multiplier: f64) -> (V, V) {
    let a = |q: V| q * (-G * multiplier * R * R / q.length().powi(3)) + external;
    let first = a(p);
    let position = p + v * dt + first * (dt * dt / 2.);
    (position, v + (first + a(position)) * (dt / 2.))
}
fn safe(v: f64) -> f64 {
    if v.is_finite() { v.clamp(-1., 1.) } else { 0. }
}
fn integrate(s: State, input: Input, dt: f64, multiplier: f64, stage: usize) -> State {
    let p = s.position();
    let radius = p.length();
    let n = p / radius;
    let mut f = (s.forward() - n * s.forward().dot(n)).normalize();
    let mut velocity = if s.grounded {
        f * s.speed
    } else {
        s.velocity()
    };
    let g = gravity_at(radius, multiplier);
    let radial = velocity.dot(n);
    let tangent = (velocity - n * radial).length();
    let sp = spec(stage);
    let requested = if input.lift > 0. {
        MASS * (g - tangent * tangent / radius
            + ((sp.lift * input.lift - radial) * 12.).clamp(-30., 70.))
        .max(0.)
    } else {
        0.
    };
    let burn = thrust(requested, dt, sp.multiplier);
    let support = MASS * (g - tangent * tangent / radius) - burn;
    let yaw_limit = if s.grounded {
        1.7_f64.min(0.7 * support.max(0.) / (MASS * s.speed.abs().max(0.1)))
    } else {
        1.7
    };
    let yaw = -input.turn * yaw_limit * dt;
    f = (f * yaw.cos() + n.cross(f) * yaw.sin()).normalize();
    let mut next = s;
    next.fuel = FUEL;
    next.thrust = burn;
    next.bank +=
        (-input.turn * 0.22 * (s.speed.abs() / 5.).min(1.) - next.bank) * (1. - (-5. * dt).exp());
    if s.grounded && support >= 0. {
        let speed = drive_speed(s.speed, input.thrust, MASS, support, dt, stage);
        let distance = speed * dt;
        let angle = distance / CONTACT;
        let normal = (n * angle.cos() + f * angle.sin()).normalize();
        f = (f * angle.cos() - n * angle.sin()).normalize();
        velocity = f * speed;
        next.set_position(normal * CONTACT);
        next.speed = speed;
        next.altitude = 0.;
        next.vy = 0.;
        next.grounded = true;
        next.distance = s.distance + distance.abs();
    } else {
        let (mut position, moved) = ballistic(p, velocity, n * (burn / MASS), dt, multiplier);
        velocity = moved;
        let mut nr = position.length();
        let normal = position / nr;
        let rotation = n.cross(normal);
        let cosine = n.dot(normal);
        if cosine > -0.999999 {
            f = f + rotation.cross(f) + rotation.cross(rotation.cross(f)) / (1. + cosine);
        }
        f = (f - normal * f.dot(normal)).normalize();
        next.grounded = false;
        if nr <= CONTACT {
            nr = CONTACT;
            position = normal * nr;
            velocity -= normal * velocity.dot(normal).min(0.);
            next.grounded = true;
            velocity = f * velocity.dot(f);
        }
        next.set_position(position);
        next.altitude = (nr - CONTACT).max(0.);
        next.vy = velocity.dot(normal);
        next.speed = velocity.dot(f);
        next.distance = s.distance + velocity.length() * dt;
    }
    next.set_forward(f);
    next.set_velocity(velocity);
    next
}
pub fn step_flight(previous: State, input: Input, dt: f64, multiplier: f64, stage: usize) -> State {
    if !previous.finite() {
        return State::default();
    }
    if !dt.is_finite() || dt <= 0. {
        return previous;
    }
    let r = previous.position().length();
    let n = previous.position() / r;
    let f = previous.forward();
    if !r.is_finite() || r < 1e-8 || (f - n * f.dot(n)).length() < 1e-8 {
        return State::default();
    }
    let controls = Input {
        thrust: safe(input.thrust),
        turn: safe(input.turn),
        lift: safe(input.lift),
        power_up: input.power_up,
    };
    let duration = dt.min(1. / 30.);
    let count = (duration / (1. / 600.)).ceil() as usize;
    let h = duration / count as f64;
    let mut s = previous;
    s.fuel = FUEL;
    for _ in 0..count {
        s = integrate(s, controls, h, multiplier, stage);
    }
    s
}
pub fn step_plateau(
    previous: State,
    input: Input,
    dt: f64,
    multiplier: f64,
    stage: usize,
) -> State {
    if !previous.finite() {
        return State::default();
    }
    if !dt.is_finite() || dt <= 0. {
        return previous;
    }
    let duration = dt.min(1. / 30.);
    let count = (duration / (1. / 600.)).ceil() as usize;
    let h = duration / count as f64;
    let drive = safe(input.thrust);
    let turn = safe(input.turn);
    let lift = safe(input.lift);
    let g = G * multiplier;
    let mut s = previous;
    for _ in 0..count {
        let heading = s.fx.atan2(-s.fz) - turn * 1.35 * h;
        s.fx = heading.sin();
        s.fy = 0.;
        s.fz = -heading.cos();
        let supported = s.x.abs() <= 14. && s.z.abs() <= 14. && s.y >= CONTACT - 0.01;
        let sp = spec(stage);
        let burn = thrust(
            if lift > 0. {
                MASS * (g + ((sp.lift * lift - s.vy) * 12.).clamp(-30., 70.))
            } else {
                0.
            },
            h,
            sp.multiplier,
        );
        if s.grounded && supported {
            s.speed = drive_speed(s.speed, drive, MASS, (MASS * g - burn).max(0.), h, stage);
            s.velocity_x = s.fx * s.speed;
            s.velocity_z = s.fz * s.speed;
        }
        s.x += s.velocity_x * h;
        s.z += s.velocity_z * h;
        s.vy += (burn / MASS - g) * h;
        s.y += s.vy * h;
        s.grounded =
            s.x.abs() <= 14. && s.z.abs() <= 14. && supported && s.y <= CONTACT && s.vy <= 0.;
        if s.grounded {
            s.y = CONTACT;
            s.vy = 0.;
        }
        s.velocity_y = s.vy;
        s.thrust = burn;
        s.fuel = FUEL;
        s.altitude = (s.y - CONTACT).max(0.);
        s.bank += (-turn * 0.15 - s.bank) * h * 5.;
        s.distance += s.velocity().length() * h;
        if s.y < -35. {
            return State::default();
        }
    }
    s
}
#[derive(Default)]
pub struct Simulation {
    pub world: usize,
    pub power: Powertrain,
    pub state: State,
    pub previous: State,
    pub running: bool,
    accumulator: f64,
}
impl Simulation {
    pub fn gravity(&self) -> f64 {
        [10., 1., 1.5, 100.][self.world]
    }
    pub fn alpha(&self) -> f64 {
        self.accumulator / (1. / 60.)
    }
    pub fn resume(&mut self) {
        self.accumulator = 0.;
        self.running = true;
    }
    pub fn pause(&mut self) {
        self.power.starter_charge = 0.;
        self.running = false;
        self.accumulator = 0.;
        self.previous = self.state;
    }
    pub fn reset(&mut self) {
        self.power = Powertrain::default();
        self.state = State::default();
        self.previous = self.state;
        self.accumulator = 0.;
    }
    pub fn change_world(&mut self, id: usize) {
        if id > 3 {
            return;
        }
        let (stage, cooldown) = (self.power.stage, self.power.starter_cooldown);
        self.pause();
        self.world = id;
        self.reset();
        self.power.stage = stage;
        self.power.starter_cooldown = cooldown;
    }
    pub fn advance(&mut self, seconds: f64, input: Input) {
        if !self.running || !seconds.is_finite() || seconds <= 0. {
            return;
        }
        let step = 1. / 60.;
        self.accumulator += seconds.min(0.1);
        while self.accumulator + 1e-10 >= step {
            self.previous = self.state;
            self.power.starter(
                input.power_up,
                self.state.grounded
                    && self.state.speed.abs() < 0.5
                    && input.thrust == 0.
                    && input.lift <= 0.,
                step,
            );
            self.state = if self.world == 3 {
                step_plateau(self.state, input, step, self.gravity(), self.power.stage)
            } else {
                step_flight(self.state, input, step, self.gravity(), self.power.stage)
            };
            let forward = self.state.speed.max(0.).max(if self.state.grounded {
                0.
            } else {
                self.state.vy
            });
            if self.state.distance == 0. && self.previous.distance > 0. {
                self.power = Powertrain::default();
            }
            self.power.advance(forward, step, self.state.grounded);
            self.accumulator = (self.accumulator - step).max(0.);
        }
    }
}
