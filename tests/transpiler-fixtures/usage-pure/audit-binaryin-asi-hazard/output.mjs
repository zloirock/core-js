import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
// the `in` rewrite that keeps its test wraps the expression, so its replacement OPENS with `(` - and
// a leading paren fuses with an unterminated previous line, reading as a CALL on whatever that line
// ended with. the rows below are the unterminated predecessors that make the fusion reachable: a
// numeric init, an array literal, a member read, a parenthesized value
const src = [3, [1, 2]];
let arr = src;
let numberInit = 1;
'flat' in (arr == null ? void 0 : _sliceMaybeArray(arr).call(arr)), true;
let arrayInit = [1];
'at' in (arr == null ? void 0 : _sliceMaybeArray(arr).call(arr)), true;
let memberInit = src.length;
'includes' in (arr == null ? void 0 : _sliceMaybeArray(arr).call(arr)), true;
let parenInit = src;
'entries' in (arr == null ? void 0 : _sliceMaybeArray(arr).call(arr)), true;
// a TERMINATED predecessor needs no guard - the control that keeps the opening paren bare
let terminated = 1;
'flat' in (arr == null ? void 0 : _sliceMaybeArray(arr).call(arr)), true;
export { numberInit, arrayInit, memberInit, parenInit, terminated };