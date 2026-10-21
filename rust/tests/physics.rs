use infinite_orb::physics::*;
#[test]
fn matches_original_traces_in_every_world_and_frame_cadence() {
    let cases: serde_json::Value =
        serde_json::from_str(include_str!("fixtures/legacy-parity.json")).unwrap();
    for case in cases.as_array().unwrap() {
        let mut s = Simulation::default();
        s.change_world(case["world"].as_u64().unwrap() as usize);
        s.resume();
        for step in case["steps"].as_array().unwrap() {
            let input: Input = serde_json::from_value(step["input"].clone()).unwrap();
            for _ in 0..step["ticks"].as_u64().unwrap() {
                s.advance(1. / case["hz"].as_f64().unwrap(), input);
            }
            for (actual, expected) in [
                (serde_json::to_value(s.state).unwrap(), &step["state"]),
                (serde_json::to_value(s.power).unwrap(), &step["power"]),
            ] {
                for (key, value) in expected.as_object().unwrap() {
                    if let Some(want) = value.as_f64() {
                        let got = actual[key].as_f64().unwrap();
                        assert!(
                            (want - got).abs() < 1e-7,
                            "world {} hz {} {key}: {want} != {got}",
                            case["world"],
                            case["hz"]
                        );
                    } else {
                        assert_eq!(&actual[key], value);
                    }
                }
            }
        }
    }
}
#[test]
fn fresh_beerus_starter_unlocks_drive_without_reducing_gravity() {
    let mut s = Simulation::default();
    s.change_world(3);
    s.resume();
    for _ in 0..119 {
        s.advance(
            1. / 60.,
            Input {
                power_up: true,
                ..Input::default()
            },
        );
    }
    assert_eq!(s.power.stage, 0);
    s.advance(
        1. / 60.,
        Input {
            power_up: true,
            ..Input::default()
        },
    );
    assert_eq!(s.power.stage, 1);
    for _ in 0..30 {
        s.advance(
            1. / 60.,
            Input {
                thrust: 1.,
                ..Input::default()
            },
        );
    }
    assert!(s.state.speed > 4.);
    assert!(s.state.distance > 1.);
    assert!(s.state.grounded);
    assert_eq!(s.gravity(), 100.);
}
