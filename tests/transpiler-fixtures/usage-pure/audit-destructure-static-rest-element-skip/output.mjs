import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
const from = _Array$from;
// rest element coexists with a static destructure: `const { from, ...rest } = Array`.
// the rest binding must not block alias registration of `from`, so subsequent calls
// still narrow the receiver to Array and instance methods dispatch array-specific
const {
  from: _unused,
  ...rest
} = Array;
const arr = from('hi');
_atMaybeArray(arr).call(arr, -1);
_findLastMaybeArray(arr).call(arr, p => p);
_copyWithinMaybeArray(arr).call(arr, 0, 1);