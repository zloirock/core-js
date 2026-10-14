import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3, _ref4;
// chain-combine whose inner receiver is another polyfilled optional call (`a.flat?.()` behind a
// second `.flat?.()`): that call is the receiver's live link, so its lookup - the polyfilled method,
// never a raw read - is the guard's first test, and the call's result is read plainly by the outer
// lookup: a missing inner method short-circuits the WHOLE chain, a nullish result throws at the
// outer read, as native does
null == (_ref = _flatMaybeArray(a)) || null == (_ref2 = _flatMaybeArray(_ref3 = _ref.call(a))) ? void 0 : _includes(_ref4 = _ref2.call(_ref3)).call(_ref4, 2);