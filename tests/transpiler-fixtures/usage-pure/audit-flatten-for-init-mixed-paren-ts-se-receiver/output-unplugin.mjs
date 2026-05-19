import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// `(((se(), globalThis) as any))` - multi-layer Paren+TS+Paren wrappers around SE init.
// requires the peel to recurse: strip outer paren, strip TS `as`, strip inner paren -
// reach the SE underneath. asserts the peel is a fixpoint over the wrapper set, not a
// single shot of one wrapper type.
for (var from = _Array$from, _unused = (se(), _globalThis); from === undefined; ) break;
export { from };