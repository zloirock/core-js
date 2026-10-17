import _Array$of from "@core-js/pure/actual/array/of";
import _self from "@core-js/pure/actual/self";
// parameter destructure whose default is a `self.Array` member (proxy-global root other than
// globalThis) with one polyfilled key (`of`) and one unpolyfilled key (`extra`). the synth swap
// owns the receiver chain, so the unpolyfilled key's member-access fallback must substitute the
// `self` proxy root to its polyfill - otherwise a bare `self` leaks and ReferenceErrors where
// `self` is undefined
function f({
  of,
  extra
} = {
  of: _Array$of,
  extra: _self.Array.extra
}) {
  return [of, extra];
}
f();