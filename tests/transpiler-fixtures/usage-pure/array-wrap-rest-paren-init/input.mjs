// Parentheses preserve the array-wrapper boundary and its native static/rest reads.
// The flat realm twin extracts values while retaining the same rest exclusions.
const seen = [];
const eff = t => (seen.push(t), t);
const [{ Object: { keys, ...restA } }] = ([globalThis]);
const { Object: { values, ...restB } } = (globalThis);
const [{ Object: { entries, ...restC } }] = ([(eff('a'), globalThis)]);
export { keys, restA, values, restB, entries, restC, seen };
