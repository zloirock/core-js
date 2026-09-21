// A constructor stored in a container carries its statics for reads the transform cannot replace.
// The obligation follows the stored value through named properties and array slots.
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
