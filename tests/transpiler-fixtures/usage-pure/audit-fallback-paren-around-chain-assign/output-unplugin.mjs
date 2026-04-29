import _Iterator from "@core-js/pure/actual/iterator/constructor";
// `let r; const {from} = (r = cond ? Array : Iterator);` - paren wraps a chain-assignment.
// Per-branch destructure rewriting peels parens BUT NOT chain-assignment - splitting
// branches into `{from: _Array$from}` would change `r`'s runtime value (intentional
// escape hatch when an outer assignment must observe the original value). Result: the
// chain-assign is treated as an opaque receiver, and the inner identifier visitor polyfills
// the constructor branch (Iterator) as a global
let r;
export const { from } = (r = cond ? Array : _Iterator);
export { r };