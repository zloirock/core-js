// babel: BigIntLiteral / NumericLiteral / StringLiteral are distinct node types
// oxc/ESTree: single `Literal` node distinguished by .value typeof + .bigint marker.
// nodeType() in estree-compat.js maps Literal -> appropriate Babel-shaped type. Used
// by both detect-usage and resolve-node-type for shape predicates
const m = new Map();
m.set(1n, 'a');
m.set(2n, 'b');
const v = m.getOrInsertComputed(3n, () => 'c');
