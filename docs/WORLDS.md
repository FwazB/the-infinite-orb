# Destinations, lore and gameplay assumptions

This local iteration adds four destinations, not a complete catalog of every Dragon Ball planet. The header selector changes actual gravity and generated scenery. Switching stops audio output, clears held controls, resets position and pauses at the new destination; the view returns to overview. R retains the current destination. All meshes are original low-poly primitives; no franchise images, extracted models or audio are bundled.

## Destination notes

- **King Kai's planet — 10g (canon):** small spherical lawn, looping road, domed house and a small car. The official North Kaio character article explicitly states ten times Earth's gravity. Trees, lakes, colors, dimensions and landmark arrangement remain a stylized miniature rather than a shot-accurate reconstruction.
- **Earth — 1g (reference):** blue water, green ground, rocky/snow-tipped highlands and a pink island house with a palm. Earth gravity is the reference unit. The island-house cue follows the official Kame House travelogue; the miniature is not a canonical world map.
- **Namek — 1.5g (gameplay assumption, NOT canon):** green sky, blue-green ground, lakes, mesas, tall Ajisa-inspired trees, domed village and three suns. The official ecosystem interview discusses three suns and lakes; its guest scientist infers approximately Earth-like gravity, which is not a canon numerical measurement. This game's 1.5g is an explicitly approved gameplay variation, not that interview's conclusion. Sky colors follow the familiar anime presentation, not a claim that all manga color editions agree.
- **Beerus's planet / Whis training — 100g (fictional training mode, NOT canon):** inverted square pyramid, flat training plateau, bare tree, small temple buildings, lake and surrounding moons. No reliable numerical gravity value or exact weight for Whis's training suits was verified. The user chose a fictional high-gravity Whis-inspired mode rather than added scooter mass. Selecting Beerus activates the user-selected 100g gameplay setting as that mode; it is not an assertion about natural planetary gravity, a canon Whis setting, or a mass-to-gravity conversion. The tree/pyramid design follows the Battle of Gods / Super depiction as described by the secondary visual references below. This is not the earlier unused design. Exact layout, scale, materials, moon positions and gravity are game interpretations.

Unknown gravity values always carry an asterisk in the badge and an explicit `not canon` label (gameplay assumption or Whis training). A fixed local catalog supplies all options; URL parameters and remote content cannot supply worlds or HTML.

## Physics and geography boundary

Spherical destinations share an 18 m gameplay radius, not a claimed canonical size. Their force law uses the selected multiplier times Earth reference gravity at that radius, falling off with inverse square distance. Thrust remains bounded and fuel unlimited. At 100g, the 300 kg scooter in Stock cannot lift with its 45 kN thruster or overcome rolling resistance. [Powertrain stages](POWERTRAIN.md) explicitly increase output capacity and carry between destinations. A two-second stationary E charge grants Stage I on the plateau itself, with a 12-second cooldown and the normal slowdown downgrade; no trip to another planet is required.

Beerus's destination intentionally is **not a sphere**: a 28 m square plateau sits atop an inverted pyramid. Its simplified local field is constant downward gravity. Driving off the edge causes a fall and a reset below the world. This flat-field approximation, platform size and respawn are game rules, not canon physics. Temples, mountains, water and trees are decorative and do not yet have obstacle collision or terrain-following suspension. All destinations retain optional cockpit view.

## Training research update — 2026-10-18

The official Dr. Brief profile supports 100g spacecraft equipment and 300g equipment for Vegeta; it does not establish either as Beerus’s natural gravity or Whis’s training setting. The 100g Whis mode remains an explicit fiction chosen for this game. No exact Whis suit mass was verified.

- [Official Dr. Brief profile](https://en.dragon-ball-official.com/news/01_2148.html), Tales 251 and 336.
- [Official South Kai profile](https://en.dragon-ball-official.com/news/01_2639.html), Tale 428: earlier weighted training, not Whis’s suits.
- [Toei Super episode 18 synopsis](https://www.toei-anim.co.jp/tv/dragon_s/episode/summary/18/): training on Beerus’s planet; no numeric gravity measurement.

## Sources checked

- [Official North Kaio showcase](https://en.dragon-ball-official.com/news/01_657.html): 10g and driving hobby.
- [Official Namek / Kakarot world comparison](https://en.dragon-ball-official.com/news/01_536.html): Ajisa trees and water-rich terrain.
- [Official Namek ecosystem interview](https://en.dragon-ball-official.com/news/01_1917.html): three suns and lakes; distinguish the guest's scientific inference from manga statements.
- [Official Kame House travelogue](https://en.dragon-ball-official.com/news/01_799.html): island-house setting.
- [Dragon Ball Wiki: Beerus's planet](https://dragonball.fandom.com/wiki/Beerus%27_Planet): secondary description of the inverted pyramid, tree, buildings and lake.
- [Kanzenshuu: Beerus's planet](https://www.kanzenshuu.com/wiki/Beerus%27_planet): secondary production/design history.

Research was descriptive only. No page images or source text were imported as shipping assets. This remains an unofficial fan prototype, with no franchise permission asserted.
