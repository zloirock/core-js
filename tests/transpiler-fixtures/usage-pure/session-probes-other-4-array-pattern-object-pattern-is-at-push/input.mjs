// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const log = [];
{
const known = { w: Object, y: [1] }; const [{ w: { is }, y: { at } }] = [known, log.push('s')]; [is, at];
}
