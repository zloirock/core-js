// `let r; const {from} = (r = cond ? Array : Iterator);` - paren wraps a chain-assignment.
// Per-branch destructure rewriting peels parens BUT NOT the chain-assignment: splitting branches
// would change `r`'s observed runtime value (intentional escape hatch). So the chain-assign stays
// an opaque receiver and only the inner identifier visitor polyfills the Iterator branch as a global.
let r;
export const { from } = (r = cond ? Array : Iterator);
export { r };
