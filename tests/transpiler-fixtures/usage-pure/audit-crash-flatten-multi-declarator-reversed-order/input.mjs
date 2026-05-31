// a multi-declarator VariableDeclaration where the proxy-global flatten declarator comes FIRST
// and the static-destructuring sibling comes second (reverse of the usual order). the flatten
// renders the whole declaration, so the sibling must be skipped order-independently to avoid a
// second whole-declaration replacement (equal-range merge crash). regression lock
const { Array: { from } } = globalThis, { of } = Array;
of;
from([1]);
