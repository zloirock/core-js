// flatten declarator NOT first in multi-decl - sibling IIFE block-body precedes the
// flattenable destructure. asserts the bug fires regardless of declarator order in
// the multi-decl
const kls = (() => { return [].values(); })(), { Array: { from } } = globalThis;
export { from, kls };
