import _at from "@core-js/pure/actual/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// direct self-cycle: visited Set bails on the first repeat instead of letting
// MAX_DEPTH counter exhaust through 64 useless iterations
type Self = Self;
declare const x: Self;
const r = _at(_ref = x as any).call(_ref, 0);
_globalThis.__r = r;