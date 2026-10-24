// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const log = [];
const [{ Object: { keys, ...rest } }] = [(log.push('init'), globalThis)];
const [{ Object: { entries = log.push('default'), ...remaining } }, tail] = [globalThis, 1];
export const r = [keys({ a: tail }), entries({ b: 2 }), log, Object.hasOwn(rest, 'keys'), Object.hasOwn(remaining, 'entries')];
