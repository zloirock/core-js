import _Array$from from "@core-js/pure/actual/array/from";
// direct inline ArrayExpression init - no Identifier alias hop. simplest ArrayPattern-
// rooted destructure shape: peel one level of ArrayExpression to reach Array, extract
// `from` as a flat const binding pointing to the polyfill
const from = _Array$from;
from([1, 2]);