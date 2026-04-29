import _isIterable from "@core-js/pure/actual/is-iterable";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// `Symbol.iterator in tag\`...\`` - tagged-template call result on RHS. The entire
// tagged-template expression is wrapped through `_isIterable` without rewriting the
// template body. Inner `Map.groupBy` resolves independently in the second statement.
const x = _isIterable(build`hello ${name}`);
const m = _Map$groupBy(items, fn);
export { x, m };