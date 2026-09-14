// The claims consumed out of a ctor hop leave a residual whose sole prop is that hop; the residual
// re-anchors at the ctor the way an untouched host does, on both legs, after the extractions drained.
const { Array: { of: { name: soleResidual }, junk: soleResidualJunk } } = globalThis;
const { Array: { prototype: { at: soleInstanceResidual }, junk: soleInstanceJunk } } = globalThis;
export { soleResidual, soleResidualJunk, soleInstanceResidual, soleInstanceJunk };
