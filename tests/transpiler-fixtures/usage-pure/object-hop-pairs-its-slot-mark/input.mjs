// A getter supplying the realm runs mark before its WeakSet leaf is bound.
// The supported constructor extraction must keep that getter effect once.
const { w: { WeakSet: keptByGetterEffect } } = { get w() { mark(); return globalThis; } };
function mark() {}
export default [keptByGetterEffect];
