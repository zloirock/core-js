// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live.
const { w: { WeakSet: keptByGetterEffect } } = { get w() { mark(); return globalThis; } };
function mark() {}
export default [keptByGetterEffect];
