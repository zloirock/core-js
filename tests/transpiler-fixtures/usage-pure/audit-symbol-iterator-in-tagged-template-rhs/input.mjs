// `Symbol.iterator in tag\`...\`` - tagged-template call result on RHS. The entire
// tagged-template expression is wrapped through `_isIterable` without rewriting the
// template body. Inner `Map.groupBy` resolves independently in the second statement.
const x = Symbol.iterator in build`hello ${name}`;
const m = Map.groupBy(items, fn);
export { x, m };
