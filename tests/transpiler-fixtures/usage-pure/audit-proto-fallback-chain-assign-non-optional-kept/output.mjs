import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// a prototype-placement ctor claim over a CHAIN-ASSIGN root harvests the kept assignment
// exactly like a sequence prefix (`(k++, _Map).prototype`): the fallback used to bail on the
// assignment and strand the raw proxy hop (`.self` unponyfilled off-engine). distinct
// constructors per line
let n;
export const nonOptionalKept = _nameMaybeFunction((n = _globalThis.window, _Map).prototype.has);