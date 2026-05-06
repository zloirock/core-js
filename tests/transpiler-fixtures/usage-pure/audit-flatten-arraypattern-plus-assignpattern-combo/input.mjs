// Both wrappers stacked: outer ArrayPattern (single element) + inner AssignmentPattern
// (default `{}`). Walker peels both layers via `peelTransparentWrappers` (multiple
// iterations of the while loop), classifier `peelDestructureWrappers` does the same plus
// tracks `arrayIndex` for ArrayExpression init lookup. Distinct methods (from / of)
// per declarator probe per-prop classification through the same combined chain
const [{ Array: { from } = {} }] = [globalThis];
const [{ Array: { of } = {} }] = [globalThis];
from('hi');
of(1, 2);
