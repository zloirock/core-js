// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const seen = [];
const eff = t => (seen.push(t), t);
const [{ Object: { keys, ...restA } }] = ([globalThis]);
const { Object: { values, ...restB } } = (globalThis);
const [{ Object: { entries, ...restC } }] = ([(eff('a'), globalThis)]);
export { keys, restA, values, restB, entries, restC, seen };
