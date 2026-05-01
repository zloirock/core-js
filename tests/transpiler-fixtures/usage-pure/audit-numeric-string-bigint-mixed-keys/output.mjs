import _Map from "@core-js/pure/actual/map/constructor";
// Map.get / Map.set / Map.has with mixed-typed keys: NumericLiteral, StringLiteral,
// BigIntLiteral. ESTree parses all three as `Literal` with .value of different types -
// nodeType() in estree-compat must dispatch correctly to BigIntLiteral / StringLiteral /
// NumericLiteral so resolve-node-type detection branches stay symmetric
const m = new _Map();
m.set(1, 'a');
m.set('two', 'b');
m.set(3n, 'c');
const v1 = m.getOrInsertComputed(2, () => 'x');
const v2 = m.getOrInsertComputed('three', () => 'y');
const v3 = m.getOrInsertComputed(4n, () => 'z');