// direct inline ArrayExpression init - no Identifier alias hop. simplest ArrayPattern-
// rooted destructure shape: peel one level of ArrayExpression to reach Array, extract
// `from` as a flat const binding pointing to the polyfill
const [{ from }] = [Array];
from([1, 2]);
