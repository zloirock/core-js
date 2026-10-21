// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
const shorthand = { Map };
const { Map: { groupBy: viaShorthand }, ...shorthandRest } = shorthand;
const renamed = { M: Map };
const { M: { groupBy: viaRenamed }, ...renamedRest } = renamed;
const indexed = [Map];
const [{ groupBy: viaIndex, ...indexRest }] = indexed;
const selected = { Map };
const { Map: { groupBy: viaSelection }, ...selectionRest } = globalThis.window ?? selected;
const reached = { get realm() { return globalThis; } };
const { realm: { Map: { groupBy: viaGetter } } } = reached;
const custom = { Set };
const { Set: { customZ: viaCustomKey }, ...customRest } = custom;
export { viaShorthand, viaRenamed, viaIndex, viaSelection, viaGetter, viaCustomKey };
export { shorthandRest, renamedRest, indexRest, selectionRest, customRest };
