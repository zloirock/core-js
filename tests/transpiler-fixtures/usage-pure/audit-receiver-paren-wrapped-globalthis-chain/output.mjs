import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// `(globalThis?.X.Y).flat?.(0);` - receiver chain wrapped in outer parens. resolveReceiver-
// Source must peel transparent wrappers (Paren / Chain / TS) at the TOP of receiverObj
// before dispatching to direct-Identifier or chain resolvers; otherwise the Member-type
// gate rejects the Paren wrap and the proxy-global leaf falls through to a less precise
// substitution path, leaving raw `globalThis` in the emit (IE11 ReferenceError).
_flatMaybeArray(_ref = _globalThis.X.Y)?.call(_ref, 0);