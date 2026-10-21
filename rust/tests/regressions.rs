use glam::DVec3;
use infinite_orb::{assets, physics::*};
fn drive() -> Input {
    Input {
        thrust: 1.,
        ..Input::default()
    }
}
fn tick(s: &mut Simulation, seconds: f64, input: Input) {
    for _ in 0..(seconds * 60.).round() as usize {
        s.advance(1. / 60., input);
    }
}
#[test]
fn world_gravity_and_disclosures_match() {
    let worlds = assets::worlds();
    assert_eq!(worlds.len(), 4);
    for (i, w) in worlds.iter().enumerate() {
        let mut s = Simulation::default();
        s.change_world(i);
        assert_eq!(s.gravity(), w.gravity);
    }
    assert_eq!(worlds[2].gravity_basis, "assumed");
    assert_eq!(worlds[3].gravity_basis, "assumed");
}
#[test]
fn every_world_and_scooter_has_valid_compiled_geometry() {
    let meshes = assets::meshes().unwrap();
    for name in [
        "world:king-kai",
        "world:earth",
        "world:namek",
        "world:beerus",
        "bike:body",
        "bike:glass",
        "bike:wheel0",
        "bike:wheel1",
        "fx:cloud",
    ] {
        assert!(meshes.iter().any(|m| m.name == name), "{name}");
    }
    for mesh in meshes {
        assert!(!mesh.vertices.is_empty());
        assert!(mesh.vertices.iter().all(|v| v.is_finite()));
        assert!(
            mesh.indices
                .iter()
                .all(|i| (*i as usize) < mesh.vertices.len() / 11)
        );
    }
}
#[test]
fn surface_gravity_is_inverse_square() {
    assert!((gravity_at(R, 10.) - G * 10.).abs() < 1e-10);
    assert!((gravity_at(2. * R, 10.) - G * 2.5).abs() < 1e-10);
}
#[test]
fn lift_force_is_bounded_even_with_infinite_fuel() {
    assert_eq!(thrust(f64::MAX, 1. / 60., 1.), MAX_THRUST);
    assert_eq!(thrust(f64::MAX, 1. / 60., 400.), MAX_THRUST * 400.);
    assert_eq!(thrust(f64::NAN, 1. / 60., 1.), 0.);
    const {
        assert!(MAX_THRUST < MASS * G * 100.);
    }
}
#[test]
fn stock_beerus_cannot_move_or_lift() {
    let mut s = Simulation::default();
    s.change_world(3);
    s.resume();
    tick(
        &mut s,
        10.,
        Input {
            thrust: 1.,
            lift: 1.,
            ..Input::default()
        },
    );
    assert!(s.state.grounded);
    assert_eq!(s.state.speed, 0.);
    assert_eq!(s.state.altitude, 0.);
    assert_eq!(s.state.fuel, FUEL);
}
#[test]
fn off_plateau_fall_uses_100g_then_respawns() {
    let initial = State {
        x: 15.,
        grounded: false,
        ..State::default()
    };
    let mut s = step_plateau(initial, Input::default(), 1. / 60., 100., 0);
    assert!((s.vy + G * 100. / 60.).abs() < 1e-8);
    for _ in 0..60 {
        s = step_plateau(s, Input::default(), 1. / 60., 100., 0);
    }
    assert!(s.grounded);
    assert_eq!(s.x, 0.);
    assert_eq!(s.y, CONTACT);
}
#[test]
fn starter_charge_cancels_on_motion_and_pause() {
    let mut s = Simulation::default();
    s.resume();
    tick(
        &mut s,
        1.,
        Input {
            power_up: true,
            ..Input::default()
        },
    );
    assert!(s.power.starter_charge > 0.);
    s.pause();
    assert_eq!(s.power.starter_charge, 0.);
    s.resume();
    tick(
        &mut s,
        1.,
        Input {
            power_up: true,
            thrust: 1.,
            ..Input::default()
        },
    );
    assert_eq!(s.power.starter_charge, 0.);
    assert_eq!(s.power.stage, 0);
}
#[test]
fn pause_freezes_cooldown_world_transfer_preserves_it_reset_clears_it() {
    let mut s = Simulation::default();
    s.resume();
    tick(
        &mut s,
        2.,
        Input {
            power_up: true,
            ..Input::default()
        },
    );
    let cooldown = s.power.starter_cooldown;
    assert_eq!(s.power.stage, 1);
    s.pause();
    tick(&mut s, 10., drive());
    assert_eq!(s.power.starter_cooldown, cooldown);
    s.change_world(3);
    assert_eq!(s.power.stage, 1);
    assert_eq!(s.power.starter_cooldown, cooldown);
    assert!(!s.running);
    s.reset();
    assert_eq!(s.power.stage, 0);
    assert_eq!(s.power.starter_cooldown, 0.);
    assert_eq!(s.gravity(), 100.);
}
#[test]
fn higher_stages_need_forward_grounded_dwell_and_expire_slowly() {
    let mut p = Powertrain::default();
    for _ in 0..120 {
        p.advance(30., 1. / 60., false);
    }
    assert_eq!(p.stage, 0);
    for _ in 0..89 {
        p.advance(6., 1. / 60., true);
    }
    assert_eq!(p.stage, 0);
    p.advance(6., 1. / 60., true);
    assert_eq!(p.stage, 1);
    for _ in 0..239 {
        p.advance(-30., 1. / 60., true);
    }
    assert_eq!(p.stage, 1);
    p.advance(0., 1. / 60., true);
    assert_eq!(p.stage, 0);
}
#[test]
fn invalid_time_input_and_state_recover_without_nan() {
    let mut s = Simulation::default();
    s.resume();
    for dt in [f64::NAN, f64::INFINITY, -1., 0.] {
        s.advance(dt, drive());
    }
    assert_eq!(s.state.distance, 0.);
    let result = step_flight(
        State {
            x: f64::NAN,
            ..State::default()
        },
        drive(),
        1.,
        10.,
        0,
    );
    assert_eq!(result.x, 0.);
    let result = step_flight(
        State::default(),
        Input {
            thrust: f64::NAN,
            turn: f64::INFINITY,
            lift: f64::NAN,
            power_up: false,
        },
        1.,
        10.,
        0,
    );
    assert!(result.position().is_finite());
    assert_eq!(result.speed, 0.);
    s.change_world(99);
    assert_eq!(s.world, 0);
}
#[test]
fn constant_speed_closes_a_complete_spherical_circuit() {
    let mut s = State {
        speed: 5.,
        ..State::default()
    };
    let circumference = std::f64::consts::TAU * CONTACT;
    for _ in 0..10000 {
        s = step_flight(
            s,
            Input {
                thrust: 5. / 8.,
                ..Input::default()
            },
            circumference / 5. / 10000.,
            10.,
            0,
        );
    }
    assert!((s.position() - State::default().position()).length() < 1e-7);
    assert!(s.position().dot(s.forward()).abs() < 1e-8);
    assert!((s.distance - circumference).abs() < 1e-7);
}
#[test]
fn long_running_lift_remains_finite_and_unlimited_then_falls() {
    let mut s = Simulation::default();
    s.resume();
    tick(
        &mut s,
        120.,
        Input {
            lift: 1.,
            ..Input::default()
        },
    );
    assert!(s.state.altitude > 100.);
    assert_eq!(s.state.fuel, FUEL);
    let radial_speed = s.state.vy;
    tick(&mut s, 120., Input::default());
    assert!(s.state.position().is_finite());
    assert!(s.state.vy < radial_speed);
    for _ in 0..36000 {
        if s.state.grounded {
            break;
        }
        s.advance(1. / 60., Input::default());
    }
    assert!(s.state.grounded);
}
#[test]
fn unpowered_orbit_preserves_energy() {
    let mut p = DVec3::new(0., 40., 0.);
    let mut v = DVec3::new((gravity_at(40., 10.) * 40.).sqrt(), 0., 0.);
    let energy = |p: DVec3, v: DVec3| v.length_squared() / 2. - G * 10. * R * R / p.length();
    let start = energy(p, v);
    for _ in 0..10000 {
        (p, v) = ballistic(p, v, DVec3::ZERO, 0.001, 10.);
    }
    assert!((energy(p, v) - start).abs() / start.abs() < 1e-7);
}
