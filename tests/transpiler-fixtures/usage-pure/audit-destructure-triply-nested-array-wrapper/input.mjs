// triply-nested ArrayPattern wrapper: receiver classification must descend through
// three ArrayExpression layers. depth-counter (vs single-flag) drives the correct
// number of element[0] hops down the host's init
const [[[{ Array: { from } }]]] = [[[globalThis]]];
from([]);
