import _at from "@core-js/pure/actual/instance/at";
// polyfill guard parenthesised inside a conditional expression test: the rewrite
// must thread through the parens to recognise the receiver.
const x = (arr == null ? void 0 : _at(arr).call(arr, 0)) ? 1 : 2;