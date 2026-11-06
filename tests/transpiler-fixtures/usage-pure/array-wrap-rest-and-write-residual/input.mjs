// Array-wrapped statics keep native reads beside rest and sibling bindings.
// Their flat realm twins still extract supported statics; all prefixes and receiver stores run once.
const seen = [];
const eff = t => (seen.push(t), t);
let kw;
const [{ Object: { fromEntries, ...restA } }] = [(eff('a'), globalThis)];
const [{ Object: { entries }, other }] = [kw = (eff('b'), globalThis), 7];
// the flat twins: the bare prefix runs first, the write stays in the residual's initializer
const { Object: { hasOwn, ...restB } } = (eff('c'), globalThis);
const { Object: { keys, ...restC } } = (kw = (eff('d'), globalThis));
export { fromEntries, restA, entries, other, hasOwn, restB, keys, restC, seen, kw };
