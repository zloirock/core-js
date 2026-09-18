// A constructor this file STORES into a container slot must bind the entry that carries the ctor's
// own statics, because pure substitutes its binding into that slot and a read can come back off it
// where no rewrite reaches - the bare `*/constructor` module installs none of them, so `_Map.groupBy`
// answers `undefined` where the realm's own `Map.groupBy` answers the function. Object-rest is the
// shape that exposes it: it stops the extraction at that level, so the static read stays native and
// lands on the substituted slot. The container names its slot however it likes - shorthand, a
// renamed key, an array index - and the obligation follows the VALUE it stores, not the key.
const shorthand = { Map };
const { Map: { groupBy: viaShorthand }, ...shorthandRest } = shorthand;
const renamed = { M: Map };
const { M: { groupBy: viaRenamed }, ...renamedRest } = renamed;
const indexed = [Map];
const [{ groupBy: viaIndex, ...indexRest }] = indexed;
// ... and a SELECTION between values reaches every arm, so a container standing as one arm owes the
// same entry - the arm a run takes is not the census's to decide
const selected = { Map };
const { Map: { groupBy: viaSelection }, ...selectionRest } = globalThis.window ?? selected;
// ... and the two negatives keep the narrow entry. A slot the pattern merely REACHES through stores
// nothing - a getter hands back the realm, and the realm's own binding answers its statics - and a
// key that names no static of the stored constructor asks nothing of the entry either
const reached = { get realm() { return globalThis; } };
const { realm: { Map: { groupBy: viaGetter } } } = reached;
const custom = { Set };
const { Set: { customZ: viaCustomKey }, ...customRest } = custom;
export { viaShorthand, viaRenamed, viaIndex, viaSelection, viaGetter, viaCustomKey };
export { shorthandRest, renamedRest, indexRest, selectionRest, customRest };
