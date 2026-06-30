import _getIterator from "@core-js/pure/actual/get-iterator";
var _ref, _ref2;
// a bare get-iterator paren-lookup (`(recv?.[(eff(), Symbol.iterator)])()`) reaches the polyfill as
// `_getIterator(recv)`. the receiver is OPTIONAL, so its computed-key side effect must fire only on the
// non-null branch - native short-circuits the `?.` before evaluating the key. the `_getIterator` call stays
// unconditional (it throws on null like native `(undefined)()`, which a whole-expression guard would swallow
// into void 0). so the key SE is guarded behind the receiver's nullishness, the call is not

// bare-Identifier receiver: re-reference is free, no memo
const a = (arr == null ? void 0 : (log(), void 0), _getIterator(arr));

// member receiver: re-read by both the guard test and the call, so memoized once into a _ref
const b = (null == (_ref = obj.list) ? void 0 : (probe(), void 0), _getIterator(_ref));

// side-effecting call receiver: memoized ahead of the key SE so the receiver evaluates first, like native
const c = (null == (_ref2 = getList()) ? void 0 : (spy(), void 0), _getIterator(_ref2));