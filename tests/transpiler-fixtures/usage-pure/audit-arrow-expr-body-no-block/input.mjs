// Arrow with expression body (not block) and a computed-key sibling: synth-swap bails on
// the computed key and body-extract bails on the non-block body. Result: the inline-default
// `{from = _polyfill}` fires, taking effect only when the property is undefined
const fn = ({ [Symbol.iterator]: iter, from }) => from([1, 2]);
fn(Array);
