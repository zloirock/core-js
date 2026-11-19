import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// member-optional method-call hop on a NON-polyfilled method (`?.foo()`): same whole-chain
// short-circuit requirement as a polyfilled hop, but the hop threads its deoptionalized verbatim
// source behind the lifted `null ==` guard instead of a binding call
null == (_ref = _flatMaybeArray(arr)?.call(arr)) ? void 0 : _includes(_ref2 = _ref.foo()).call(_ref2, 0);