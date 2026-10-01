// a guarded alias whose candidates include a realm proxy the build cannot spell as a binding
// (`window`, reached through `globalThis.window`) compares through the realm entry, never a bare
// name: off a browser the bare read throws before the next candidate is tried (the shape babel's
// lowering leaves behind a defaulted destructure over a realm-selecting init)
var held = {};
var slot = held.k;
var probe;
slot = slot === void 0 ? (probe = globalThis.window) != null ? probe : globalThis : slot;
export const viaKeyed = slot.Map.groupBy;
export const viaNamespace = slot.Math.trunc;
