const { w: { WeakSet: keptByGetterEffect } } = { get w() { mark(); return globalThis; } };
function mark() {}
export default [keptByGetterEffect];
