import _globalThis from "@core-js/pure/actual/global-this";
import _entries from "@core-js/pure/actual/instance/entries";
// the use sits BEFORE the declarator inside the loop body. the loop-reinit declarator-self violation
// is ignored (so the loop alone wouldn't bail), but on the FIRST iteration M is still `undefined` at
// the use, so the source-order leg bails - resolving `M.Object.entries` would mask that native throw
function f() {
  while (c) {
    var _ref;
    _entries(_ref = M.Object).call(_ref, {
      a: 1
    });
    var M = _globalThis;
  }
}