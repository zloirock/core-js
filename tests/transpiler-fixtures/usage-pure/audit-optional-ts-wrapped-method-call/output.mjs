import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// TS-wrapped object expression in optional call: `((obj as any)?.at)?.(0)`. the optional
// chain rewrite must walk past TS wrappers between the replaced inner member and the outer
// optional. distinct second method on the next line for observable dispatch
const a = null == obj as any ? void 0 : _at(obj as any)?.call(obj as any, 0);
const b = null == obj as any ? void 0 : _flatMaybeArray(obj as any)?.call(obj as any);