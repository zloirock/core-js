// A mutable local callee is read directly between an optional guard and its call.
// Retaining the returned container's static and instance claims must preserve that guard.
let forward;
if (flag) forward = () => ({ window: { Array } });
export const value = forward?.().window.Array.of(observe()).at(0);
