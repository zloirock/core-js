import _isIterable from "@core-js/pure/actual/is-iterable";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
// comma-tail receiver: `Symbol` / `Map` / `Promise` in the tail of a comma expression with
// side-effect-bearing preceding element. plugin's polyfill-emit subsumes the receiver
// identifier; without a skipped-nodes seed the identifier visitor queues a parallel
// `X -> _X` transform whose needle composes into the outer's `_X$Y` replacement text as
// `__X$Y` (substring `X` inside the outer's emit gets re-prefixed). expected:
// single-underscore polyfill identifiers, parity with babel
const a = (tag`hi`, _isIterable(obj));
const b = (foo(), _Map$groupBy)([1], k => k);
const c = (x = 1, _Promise$try)(() => 1);
const d = (foo(), _Symbol$asyncIterator);
export { a, b, c, d };