import _Array$from from "@core-js/pure/actual/array/from";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
// One alias binding feeds three narrowing queries with different return-type shapes
// (iterator, element, array) in the same traversal pass.
// Verifies the alias-narrow context stays stable across multiple visitor invocations.
const fromAlias = _Array$from;
const seq = fromAlias('abc');
const it = _entriesMaybeArray(seq).call(seq);
const last = _findLastMaybeArray(seq).call(seq, x => x === 'b');
const part = _sliceMaybeArray(seq).call(seq, 0, 2);
export { it, last, part };