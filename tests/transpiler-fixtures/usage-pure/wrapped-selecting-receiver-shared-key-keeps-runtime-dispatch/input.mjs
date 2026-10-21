// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
function viaParamDefault([{ entries: e }] = [c ? Object : userObj]) { return e; }
const { w: { keys: viaKeyed } } = { w: c ? Object : userObj };
const { w: [{ values: viaKeyedArray }] } = { w: [c ? Object : userObj] };
export { viaParamDefault, viaKeyed, viaKeyedArray };
