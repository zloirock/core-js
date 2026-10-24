// the plain `var` form exercises the recompute path: the binding's own rewritten declarator
// must not count as a reassignment of itself
var { asyncIterator } = Symbol;
export const viaPlainVar = [][asyncIterator];
