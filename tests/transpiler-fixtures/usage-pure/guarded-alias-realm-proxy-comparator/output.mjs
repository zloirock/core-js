import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
var _ref;
// a guarded alias whose candidates include a realm proxy the build cannot spell as a binding
// (`window`, reached through `globalThis.window`) compares through the realm entry, never a bare
// name: off a browser the bare read throws before the next candidate is tried (the shape babel's
// lowering leaves behind a defaulted destructure over a realm-selecting init)
var held = {};
var slot = held.k;
var probe;
slot = slot === void 0 ? (probe = _globalThis.window) != null ? probe : _globalThis : slot;
export const viaKeyed = (slot === _globalThis ? _Map : slot.Map).groupBy;
export const viaNamespace = (_ref = slot.Math, _ref === Math ? _Math$trunc : _ref.trunc);