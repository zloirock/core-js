import _globalThis from "@core-js/pure/actual/global-this";
// a function-scoped `var` proxy-global alias assigned only inside `if (c)`. `var` hoists the
// binding to the whole function, but the assignment runs only when `c` is truthy and the use sits
// OUTSIDE the branch - so M is undefined when c is falsy. resolving `M.Array.from` to a receiver-
// less `_Array$from` would mask that native TypeError, so the assignment must dominate the use
// before the alias resolves. it doesn't here, so `M.Array.from([1])` is left untouched (sound)
function f() {
  if (c) {
    var M = _globalThis;
  }
  M.Array.from([1]);
}