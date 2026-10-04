import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// mutually-recursive type aliases - resolution bails on cycle
type A = B;
type B = A;
declare const x: A;
const r = _at(x as any).call(x as any, 0);
_globalThis.__r = r;