import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _globalThis from "@core-js/pure/actual/global-this";
// a hoisted-var alias assigned on ONE path holds the global only through that branch: off-branch
// the source throws on the member read, and outside browsers (`self` absent) it throws even on
// the assigned path - a proxy-hop collapse would rescue reads the source guarantees to throw.
// the alias-follow requires the init to DOMINATE the use before any pure rewrite, so BOTH
// emitters keep the receiver verbatim here; a dominating placement (module const, function-top
// var) still collapses the redundant hop
function f(c) {
  if (c) {
    var g = _globalThis;
  }
  return _findLastIndexMaybeArray((0, g.self).Array.prototype);
}
export { f };