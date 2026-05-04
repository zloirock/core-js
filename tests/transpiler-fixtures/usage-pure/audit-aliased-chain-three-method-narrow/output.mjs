import _Array$from from "@core-js/pure/actual/array/from";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
// stress alias-chain narrowing under sequential type-resolver invocations: the same
// `_Array$from` binding feeds three distinct narrowing queries triggered by visitor
// callbacks across the same traversal. each chained call queries getBindingInfo via
// typeResolvers' lazy closure - verifies the closure reads a stable currentInjector
// reference for the duration of one transform.
//   - `entries` returns ArrayIterator (iterator-typed return path)
//   - `findLast` returns element (Array-only entry, no generic instance variant)
//   - `slice` returns Array (return-type identity narrowing back to alias source kind)
const fromAlias = _Array$from;
const seq = fromAlias('abc');
const it = _entriesMaybeArray(seq).call(seq);
const last = _findLastMaybeArray(seq).call(seq, x => x === 'b');
const part = _sliceMaybeArray(seq).call(seq, 0, 2);
export { it, last, part };