// a REST host whose init the parser keeps PARENTHESIZED: the rest carrier reads the init through the
// runtime peel, so the residual anchors exactly as it does for the bare spelling - on both the
// wrapped and the flat host, with a prefix lifted or kept inside the same way
const seen = [];
const eff = t => (seen.push(t), t);
const [{ Object: { keys, ...restA } }] = ([globalThis]);
const { Object: { values, ...restB } } = (globalThis);
const [{ Object: { entries, ...restC } }] = ([(eff('a'), globalThis)]);
export { keys, restA, values, restB, entries, restC, seen };
