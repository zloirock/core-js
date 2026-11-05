// A polyfilled call buried in an array element's prefix keeps its own substitution.
// The enclosing Map.groupBy read stays native and the prefix runs once in its original slot.
const seen = [];
const eff = t => (seen.push(t), t);
const w = "abc";
const [{ Map: { groupBy } }] = [(eff(w.at(-1)), globalThis)];
export { groupBy, seen };
