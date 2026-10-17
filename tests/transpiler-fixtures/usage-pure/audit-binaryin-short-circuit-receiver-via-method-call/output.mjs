// the fold replays CALLS, and what it may erase is decided scope-aware: only a callee it can
// reach AND prove effect-free folds away. an unreachable callee is UNKNOWN, not pure - a method
// call, an imported function, a tagged template (whose tag no callee resolution reaches) all keep
// their evaluation ahead of the constant
let calls = 0;
const box = {
  make() {
    calls++;
    return [1];
  }
};
export const viaMethodCall = (box.make(), true);
export { calls };