import _globalThis from "@core-js/pure/actual/global-this";
// usage-pure: the inline-callee `g` is conditionally reassigned BEFORE the use, so the write can
// reach `g().Array.from`. even though both arrows return the same globalThis, pure does not prove
// the conditional reassignment is value-equivalent (the receiver-dropping rewrite would be wrong if
// the branches differed), so it conservatively bails - no `_Array$from`, only the bare `globalThis`
// becomes `_globalThis`. usage-global over-injects via the non-dominating init and resolves: the bias
// asymmetry (audit-iife-callee-conditional-reassign-resolves-static).
function f(c) {
  let g = () => _globalThis;
  if (c) {
    g = () => _globalThis;
  }
  return g().Array.from([1, 2, 3]);
}