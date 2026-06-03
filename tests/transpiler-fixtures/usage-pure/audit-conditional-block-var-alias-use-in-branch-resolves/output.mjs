import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// the use sits INSIDE the same `if` branch, AFTER the assignment, so every path that reaches it
// has already run `var M = globalThis` - the assignment dominates and `M.Object.fromEntries`
// resolves. proves the dominance gate isn't a blanket "conditional var bails", only an
// escapes-the-branch bail
function f() {
  if (c) {
    var M = _globalThis;
    _Object$fromEntries([['a', 1]]);
  }
}