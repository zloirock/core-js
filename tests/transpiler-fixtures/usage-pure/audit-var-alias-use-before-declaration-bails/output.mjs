import _globalThis from "@core-js/pure/actual/global-this";
// source-order leg of the dominance check: the `var` declaration hoists but its assignment runs at
// the textual position, so a use BEFORE the (unconditional) declarator reads `undefined`. usage-pure
// bails rather than rewrite `M.Object.fromEntries` to a receiver-less helper that wouldn't throw
function f() {
  M.Object.fromEntries([['a', 1]]);
  var M = _globalThis;
}