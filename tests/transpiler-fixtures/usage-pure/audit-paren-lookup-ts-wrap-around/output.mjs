import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// `((arr?.at) as any)(0)` wraps an optional member in parens + TS cast then makes a
// NON-optional outer call. polyfill must preserve native semantics: nullish throws,
// success keeps `this=arr` through the paren-wrapped Reference Type
const a = (arr == null ? void 0 : _at(arr)).call(arr, 0);
const b = (arr == null ? void 0 : _flatMaybeArray(arr)).call(arr);