import _at from "@core-js/pure/actual/instance/at";
// line-level disable directive followed by CRLF newline: the directive's scope ends
// at the next semantic line regardless of newline style.
const a = _at(arr).call(arr, 0);
// core-js-disable-next-line
const b = arr.at(0);