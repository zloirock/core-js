import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _isIterable from "@core-js/pure/actual/is-iterable";
import _self from "@core-js/pure/actual/self";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _Symbol$toStringTag from "@core-js/pure/actual/symbol/to-string-tag";
// well-known-symbol receiver folding by CONTEXT: a GET collapses through the strand and folds an
// unresolvable chain ROOT to the nav's resolvable VALUE (`window.self` reads off the pure self
// entry on BOTH emitters - the raw nav is a ReferenceError off-browser), while a doubly
// unresolvable nav stays the genuine argument; a WRITE HOST (`++` / `delete`) survives with a
// key-only rewrite and folds its receiver like the plain-key member channel; a for-x aliased
// body read deopts to the raw slot read of the substituted root on BOTH emitters
export const windowGet = _getIteratorMethod(_self);
let a;
export const keptParenGet = _getIteratorMethod((a = window, _self));
export const doubleUnresolvable = _getIteratorMethod(window.window);
export function bump() {
  return _self[_Symbol$iterator]++;
}
export function drop() {
  delete _self[_Symbol$toStringTag];
}
export function loop(xs) {
  for (_self[_Symbol$iterator] of xs) {
    void _globalThis[_Symbol$iterator];
  }
}
// a tagged-template tag is a this-carrying invocation: the member survives with a key-only
// rewrite and the receiver renders through the root drive (raw for an unresolvable root)
export function tag(t) {
  return _globalThis[_Symbol$iterator]`${t}`;
}
export const inHas = _isIterable(_self);