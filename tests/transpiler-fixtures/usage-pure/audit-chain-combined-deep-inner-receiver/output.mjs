import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3;
// chain-combine whose inner receiver is another polyfilled optional chain (`a.flat?.()` behind a
// second `.flat?.()`): the inner-most call must be polyfilled inside the memoized receiver, not
// emitted raw. leaving the receiver subtree visitable lets its standalone polyfill apply.
// the receiver's own live `?.` short-circuits the WHOLE chain natively, so it is TESTED before
// the outer helper reads it - folding it into the helper argument threw on a missing method
// where native yields undefined
null == (_ref = _flatMaybeArray(a)?.call(a)) || null == (_ref2 = _flatMaybeArray(_ref)) ? void 0 : _includes(_ref3 = _ref2.call(_ref)).call(_ref3, 2);