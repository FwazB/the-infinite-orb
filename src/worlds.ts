export interface WorldDefinition {
 readonly id:string;readonly name:string;readonly gravity:number;
 readonly gravityBasis:'canon'|'reference'|'assumed';readonly gravityNote:string;
 readonly shape:'sphere'|'plateau';readonly sky:string;readonly ground:string;
 readonly water:string;readonly road:string;readonly leaves:readonly string[];
 readonly description:string;
}
/** Curated fixed data, never loaded from query strings or remote services. See docs/WORLDS.md. */
export const WORLDS:readonly WorldDefinition[]=Object.freeze([
 {id:'king-kai',name:'King Kai’s planet',gravity:10,gravityBasis:'canon',gravityNote:'10g · confirmed in the manga',shape:'sphere',sky:'#bcb0e2',ground:'#8fd366',water:'#54bbd7',road:'#efc581',leaves:['#3caa90','#67c79c','#ed9ab5','#8abbe0'],description:'A tiny lawn, a looping road and the Kai’s domed home. Canon gravity; stylized miniature scenery.'},
 {id:'earth',name:'Earth',gravity:1,gravityBasis:'reference',gravityNote:'1g · Earth reference',shape:'sphere',sky:'#83bad9',ground:'#5caa74',water:'#3679c5',road:'#d9bd87',leaves:['#245b50','#37815b','#6ca26a'],description:'Blue oceans, green continents, rocky highlands and a little island home. A Dragon Ball-inspired miniature, not a geographic map.'},
 {id:'namek',name:'Namek',gravity:1.5,gravityBasis:'assumed',gravityNote:'1.5g · gameplay assumption, not canon',shape:'sphere',sky:'#8cbf85',ground:'#65b8b1',water:'#48699c',road:'#b2d8ba',leaves:['#78bd56','#a5d768','#5d9c43'],description:'Green skies, blue-green plains, lakes, tall Ajisa-inspired trees and pale domed houses. Original Namek-inspired landscape.'},
 {id:'beerus',name:'Beerus’s planet',gravity:100,gravityBasis:'assumed',gravityNote:'Whis training · 100g · not canon',shape:'plateau',sky:'#b6a0ce',ground:'#a6bb91',water:'#6e8fb8',road:'#d0bb9e',leaves:['#82637d'],description:'Whis-inspired 100g challenge (not canon). Stock is underpowered: hold E for 2s at rest to charge Stage I, then drive or lift. Keep moving; power fades after 4s below its holding speed. No claim about natural planetary gravity or suit weight.'}
].map(world=>Object.freeze({...world,leaves:Object.freeze(world.leaves)}) as WorldDefinition));
export function worldById(id:string):WorldDefinition{
 const world=WORLDS.find(world=>world.id===id);if(!world)throw new Error('Unknown world');return world;
}
