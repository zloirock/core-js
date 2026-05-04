import _at from "@core-js/pure/actual/instance/at";
import _endsWithMaybeString from "@core-js/pure/actual/string/instance/ends-with";
// the deoptionalize-needle comment skip must terminate cleanly when a `//` line comment
// runs to EOF without a trailing newline. the indexOf walk for newline returns -1 in
// that case and the helper returns src.length so `?.` classification falls through.
// distinct methods on each line: at / endsWith
const a = arr == null ? void 0 : _at(arr).call(arr, 0);
const b = str == null ? void 0 : _endsWithMaybeString(str).call(str, 'x');