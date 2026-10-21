// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const log = [];
const extra = { get value() { log.push(typeof from); return 7; } };
let from = 'old', value;
({ Array: { from }, value } = { ...extra, Array });
export { from, value, log };
