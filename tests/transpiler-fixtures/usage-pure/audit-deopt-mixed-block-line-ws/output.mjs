import _includes from "@core-js/pure/actual/instance/includes";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _endsWithMaybeString from "@core-js/pure/actual/string/instance/ends-with";
// mixed gap between `?.` and the next token: whitespace, block comment, whitespace,
// line comment, newline. the helper must walk each kind in order. each line uses a
// distinct polyfilled method: includes / flat / endsWith
const a = arr == null ? void 0 : _includes(arr).call(arr, 1);
const b = arr == null ? void 0 : _flatMaybeArray(arr).call(arr);
const c = str == null ? void 0 : _endsWithMaybeString(str).call(str, 'x');