// a catch parameter `M` shadows the outer hoisted `var M = globalThis` inside the catch block,
// so the `M = ...` write there binds the catch param, not the var. the reassignment scan must skip
// it; otherwise it counts as a constant violation of the hoisted var and drops the polyfill. with
// the skip the globalThis alias survives and `M.Map.groupBy(...)` injects the group-by polyfill
function outer() {
  {
    var M = globalThis;
  }
  try {
    risky();
  } catch (M) {
    M = fallback;
  }
  return M.Map.groupBy([], x => x);
}
