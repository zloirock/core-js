import _Array$from from "@core-js/pure/actual/array/from";
// doubly-nested ArrayPattern wrapper around an ObjectPattern destructure: the host's
// init is a doubly-nested ArrayExpression. nested-receiver walker must descend through
// every ArrayPattern level to recover the inner ObjectExpression and resolve the chain
const from = _Array$from;
from([]);