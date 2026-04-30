// Arrow with expression body (not block) and computed-key sibling: synth-swap bails
// (computed key) and body-extract bails too (`!t.isBlockStatement(fnPath.node.body)`).
// Result: inline-default `{from = _polyfill}` fires only on undefined property
const fn = ({ [Symbol.iterator]: iter, from }) => from([1, 2]);
fn(Array);
