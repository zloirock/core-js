import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// parsers tolerate block / line comments between `?.` and the next token. classification
// of `?.` (drop both for `?.(`/`?.[`, keep `.` for `?.identifier`) must look past the
// comment to the structural next-token, not at the first non-whitespace char. each line
// uses a distinct method to make per-line dispatch visible: the composed `?./*c*/at?./*c*/(0)`
// shape exercises the path where a polyfilled instance is immediately followed by an
// optional call, so the inner deoptionalize must align with the outer guard transform
const a = arr == null ? void 0 : _flatMaybeArray(arr).call(arr);
const b = obj == null ? void 0 : _at(obj)?.call(obj, 0) /* call */;
const c = list == null ? void 0 : _includes(list)?.call(list, 1) /* call */;
const d = map?. /* k */get('k');