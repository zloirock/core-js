import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// parsers tolerate comments between `?.` and the next token. classifying `?.` (drop both for
// `?.(`/`?.[`, keep `.` for `?.identifier`) must look past the comment to the structural next
// token, not the first non-whitespace char. each line uses a distinct method; the composed
// `?./*c*/at?./*c*/(0)` shape aligns an inner deoptionalize with the outer optional-call guard
const a = arr == null ? void 0 : _flatMaybeArray(arr).call(arr);
const b = obj == null ? void 0 : _at(obj)?.call(obj, 0) /* call */;
const c = list == null ? void 0 : _includes(list)?.call(list, 1) /* call */;
const d = map?. /* k */get('k');