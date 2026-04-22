import _at from "@core-js/pure/actual/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// mutually-recursive type aliases — `followTypeAliasChain` must bail on cycle
// without exhausting MAX_DEPTH (memory waste on subst Map per iteration)
type A = B;
type B = A;
declare const x: A;
const r = _at(_ref = x as any).call(_ref, 0);
_globalThis.__r = r;