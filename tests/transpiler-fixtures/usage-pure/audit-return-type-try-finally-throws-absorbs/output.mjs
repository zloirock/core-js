import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// finalizer that unconditionally throws absorbs try/catch returns: the try's
// `return [1,2,3]` is shadowed by the throw - caller never observes the array.
// `nodeAlwaysExits(finalizer)` covers throw/break/continue too, not just return,
// so this counts as an unconditional override even though `finalizerReturns` is
// empty. fn body fold therefore yields zero returns - falls back to the implicit
// `$Primitive('undefined')`. with the second-branch `return 'fallback'` as the
// other path's source, the merged type is string; without the override gate, the
// resolver would have merged Array from try + string from the second return,
// produced a disagreement, and bailed entirely
declare const cond: boolean;
function probe() {
  if (cond) {
    try {
      return [1, 2, 3];
    } finally {
      throw new Error('always');
    }
  }
  return 'fallback';
}
_atMaybeString(_ref = probe()).call(_ref, 0);