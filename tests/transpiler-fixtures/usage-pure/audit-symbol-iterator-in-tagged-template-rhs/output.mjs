import _isIterable from "@core-js/pure/actual/is-iterable";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// `Symbol.iterator in tag\`...\`` - tagged-template call result on RHS. handleBinaryIn
// wraps the entire TaggedTemplateExpression through `_isIterable` without touching the
// template itself. inner `Map.groupBy` resolves independently in the second statement.
const x = _isIterable(build`hello ${name}`);
const m = _Map$groupBy(items, fn);
export { x, m };