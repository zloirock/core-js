import _isIterable from "@core-js/pure/actual/is-iterable";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
// comma-tail receiver: `Symbol` / `Map` / `Promise` in the tail of a comma expression
// with a side-effect-bearing prefix. the polyfill emit subsumes the receiver identifier;
// without seeding it as skipped the identifier visitor queues a parallel `X -> _X` rewrite
// that re-prefixes `X` inside the outer's `_X$Y` emit as `__X$Y`. expected: single-underscore
// identifiers, parity with babel.
const a = (tag`hi`, _isIterable(obj));
const b = (foo(), _Map$groupBy)([1], k => k);
const c = (x = 1, _Promise$try)(() => 1);
const d = (foo(), _Symbol$asyncIterator);
export { a, b, c, d };