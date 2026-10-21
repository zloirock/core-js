// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const log = [];
const eff = t => (log.push(t), t);
const out = [];
for (const [{ from }, tail] of [[Array, eff(1)], [Array, eff(2)]]) out.push(from([1]).length, tail);
for (let [{ of }, count] of [[Array, 1]]) out.push(of(1).length, count);
for (const [{ Array: { isArray } }, tail] of [[globalThis, eff(3)]]) out.push(isArray([]), tail);
for (const [[{ from }], tail] of [[[Array], 4]]) out.push(from([1]).length, tail);
export { out, log };
