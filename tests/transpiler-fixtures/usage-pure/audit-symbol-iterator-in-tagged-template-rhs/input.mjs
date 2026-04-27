// `Symbol.iterator in tag\`...\`` - tagged-template call result on RHS. handleBinaryIn
// wraps the entire TaggedTemplateExpression through `_isIterable` without touching the
// template itself. inner `Map.groupBy` resolves independently in the second statement.
const x = Symbol.iterator in build`hello ${name}`;
const m = Map.groupBy(items, fn);
export { x, m };
