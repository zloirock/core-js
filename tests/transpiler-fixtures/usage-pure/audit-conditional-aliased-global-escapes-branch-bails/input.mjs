// distinct resolution path from the globalThis-proxy alias: a `var O = Object` aliases the
// constructor DIRECTLY (resolveAliasedGlobalName, not the proxy-global root walk). assigned only in
// `if (c)` and used OUTSIDE the branch, so usage-pure BAILS - rewriting `O.fromEntries` to a
// receiver-less `_Object$fromEntries` would drop O and mask the native TypeError when c is falsy.
// proves the dominance gate covers the aliased-global path too, not just globalThis-proxy
function f() {
  if (c) { var O = Object; }
  O.fromEntries([['a', 1]]);
}
