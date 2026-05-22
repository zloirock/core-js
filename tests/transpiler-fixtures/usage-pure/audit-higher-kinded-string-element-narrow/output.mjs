import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// higher-kinded type alias applied with an inner argument. After resolution
// the bound instance must be rebuilt with the substituted inner so the second
// member call narrows on the inner element type, not on the bare container.
type Wrap<F, X> = F<X>;
declare const r: Wrap<Array, string>;
null == (_ref = _atMaybeArray(r).call(r, 0)) ? void 0 : _atMaybeString(_ref).call(_ref, 0);