import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// member-optional method-call hop (`?.at()`) between an optional inner call (`flat?.()`) and a
// polyfilled outer call (`.includes`): a nullish `flat()` result must short-circuit the WHOLE
// chain to undefined, NOT invoke `.at` on it. the threaded receiver lifts a `null ==` guard so the
// optional hop's short-circuit survives the combine
null == (_ref = _flatMaybeArray(arr)?.call(arr)) ? void 0 : _includes(_ref2 = _at(_ref).call(_ref)).call(_ref2, 0);