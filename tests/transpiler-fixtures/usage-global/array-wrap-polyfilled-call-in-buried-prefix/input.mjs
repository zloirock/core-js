// A call the build polyfills inside the prefix an array wrapper's element buries keeps its own
// substitution while the static beside it is served by a literal in the slot: the prefix stays where
// the source wrote it, ahead of that literal, and runs once.
const seen = [];
const eff = t => (seen.push(t), t);
const w = "abc";
const [{ Map: { groupBy } }] = [(eff(w.at(-1)), globalThis)];
export { groupBy, seen };
