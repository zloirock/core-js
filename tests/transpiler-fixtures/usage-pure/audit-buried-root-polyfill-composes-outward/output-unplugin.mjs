import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$values from "@core-js/pure/actual/object/values";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref, _ref2, _ref3, _ref5, _ref6, _ref7;
// a polyfill BURIED inside a kept chain root: the claim between them replaces the whole chain, so
// the buried rewrite has no slot there - it has one in the GUARD, which re-emits that root as its
// test. the fold has to reach past the claim to the transform that actually kept the text; blaming
// the inner instead aborted the build on a shape that composes. one method per row keeps it readable.
export const inBody = null == (_ref = (() => (_Array$from([1]), _globalThis))()?.window) ? void 0 : _atMaybeArray(_ref2 = _Array$of(5)).call(_ref2, 0);
export const inArgument = null == ((x) => _globalThis)(_Object$entries({ a: 1 })).window ? void 0 : _Set.prototype.has.call(new _Set([1]), 1);
// a POLYFILLED prefix statement in the body forces a scoped `var` into it, and that injection must
// not put the body back as SOURCE - the render had already resolved the returned global there
export const inEffectfulBody = null == (_ref3 = (() => { var _ref4;
  _includesMaybeArray(_ref4 = _Object$values({ b: 2 })).call(_ref4, 2);
  return _globalThis;
})()?.window) ? void 0 : _toFixedMaybeNumber(_ref5 = _Number$MAX_SAFE_INTEGER).call(_ref5, 2);

// NEGATIVE: nothing polyfillable inside the root - the claim owns the whole span with no inner left
export const emptyRoot = null == (_ref6 = (() => _globalThis)()?.window) ? void 0 : _flatMapMaybeArray(_ref7 = _Reflect$ownKeys({ c: 3 })).call(_ref7, key => [key]);