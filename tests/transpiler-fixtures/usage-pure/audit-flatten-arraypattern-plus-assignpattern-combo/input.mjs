// Both wrappers stacked: outer ArrayPattern (single element) + inner AssignmentPattern
// (default `{}`). walker peels both transparent destructure wrapper layers (multiple
// iterations of the while loop); classifier does the same plus tracks `arrayIndex` for
// ArrayExpression init lookup. distinct methods (from / of) per declarator probe per-prop
// classification through the same combined chain
const [{ Array: { from } = {} }] = [globalThis];
const [{ Array: { of } = {} }] = [globalThis];
from('hi');
of(1, 2);
