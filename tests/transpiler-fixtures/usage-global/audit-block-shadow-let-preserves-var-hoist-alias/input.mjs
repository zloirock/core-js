// a nested-block `var M = globalThis` hoists to the function scope; a sibling block's `let M`
// reassignment writes a DISTINCT block-scoped binding, not the hoisted var. the reassignment scan
// must skip the shadowing `let M` rather than count it as a constant violation, so the hoisted
// `globalThis` alias survives and `M.Map.groupBy(...)` injects the group-by polyfill
function outer() {
  {
    var M = globalThis;
  }
  {
    let M = 1;
    M = 2;
  }
  return M.Map.groupBy([], x => x);
}
