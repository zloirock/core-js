import _Array$from from "@core-js/pure/actual/array/from";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
// Pre-pass injects `_Array$from`; post-pass must still recognise it as the array constructor source.
// Receiver narrowing on the alias-stored result must survive the dedup boundary across passes.
const xs = _Array$from('abc');
const e = _entriesMaybeArray(xs).call(xs);
const k = _keysMaybeArray(xs).call(xs);
const s = _sliceMaybeArray(xs).call(xs, 0, 2);