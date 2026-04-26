import _Iterator from "@core-js/pure/actual/iterator/constructor";
// `let r; const {from} = (r = cond ? Array : Iterator);` - paren wraps a chain-assignment.
// per-branch synth-swap peels paren BUT NOT chain-assignment - splitting branches into
// `{from: _Array$from}` would change `r`'s runtime value (intentional escape hatch matching
// `audit-per-branch-chain-assignment`). result: chain-assign treated as opaque receiver,
// inner Identifier visitor polyfills the constructor branch (Iterator) as a global
let r;
export const {
  from
} = r = cond ? Array : _Iterator;
export { r };