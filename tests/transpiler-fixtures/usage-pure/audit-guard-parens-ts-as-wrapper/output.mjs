import _at from "@core-js/pure/actual/instance/at";
// polyfill guard parenthesised inside a TS `as` wrapper: the rewrite must peel both
// the parens and the cast to recognise the receiver.
const x = ((arr == null ? void 0 : _at(arr).call(arr, 0)) as any).foo;