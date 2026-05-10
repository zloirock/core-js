// doubly-nested ArrayPattern wrapper around an ObjectPattern destructure: the host's
// init is a doubly-nested ArrayExpression. nested-receiver walker must descend through
// every ArrayPattern level to recover the inner ObjectExpression and resolve the chain
const [[{ Array: { from } }]] = [[globalThis]];
from([]);
