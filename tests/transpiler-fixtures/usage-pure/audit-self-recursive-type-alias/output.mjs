import _at from "@core-js/pure/actual/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// direct self-cycle type alias — resolution bails immediately without hanging
type Self = Self;
declare const x: Self;
const r = _at(_ref = x as any).call(_ref, 0);
_globalThis.__r = r;