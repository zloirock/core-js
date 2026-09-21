// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const seen = [];
const eff = t => (seen.push(t), t);
const [{ Object: { keys, ...restA } }] = ([globalThis]);
const { Object: { values, ...restB } } = (globalThis);
const [{ Object: { entries, ...restC } }] = ([(eff('a'), globalThis)]);
export { keys, restA, values, restB, entries, restC, seen };
