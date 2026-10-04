import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// direct self-cycle type alias - resolution bails immediately without hanging
type Self = Self;
declare const x: Self;
const r = _at(x as any).call(x as any, 0);
_globalThis.__r = r;