import _Array$from from "@core-js/pure/actual/array/from";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
// The array returned by Array.from narrows the following instance reads. A phase test
// introduces another read on xs after pre has replaced Array.from with an import.
const xs = _Array$from('abc');
const e = _entriesMaybeArray(xs).call(xs);
const k = _keysMaybeArray(xs).call(xs);
const s = _sliceMaybeArray(xs).call(xs, 0, 2);