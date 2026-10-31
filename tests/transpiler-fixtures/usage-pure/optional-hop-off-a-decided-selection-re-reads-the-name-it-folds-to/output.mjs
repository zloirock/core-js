import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
// a `?.` hop off a selection the build decides re-reads the name the selection folds to, so a static
// read off it takes the identity guard that name's own read takes: a reassigned alias, a loop head
class Shim {}
let A = Array;
if (_globalThis.c) A = Shim;
export const named = null == A ? void 0 : _nameMaybeFunction(A === Array ? _Array$fromAsync : A.fromAsync);
export const firsts = [];
for (const B of [Array]) {
  var _ref;
  (_pushMaybeArray(firsts) || 0).call(firsts, null == B ? void 0 : _includesMaybeArray(_ref = _Array$from([3])).call(_ref, 3));
}