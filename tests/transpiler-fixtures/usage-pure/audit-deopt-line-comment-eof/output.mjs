import _at from "@core-js/pure/actual/instance/at";
import _endsWithMaybeString from "@core-js/pure/actual/string/instance/ends-with";
// Line comments between optional tokens and member names end at newlines.
// Both calls must remain recognizable across the comment.
// distinct methods on each line: at / endsWith
const a = arr // hint at
== null ? void 0 : _at(arr).call(arr, 0);
const b = str // hint endsWith
== null ? void 0 : _endsWithMaybeString(str).call(str, 'x');