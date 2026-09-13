import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const {
  from,
  ...rest
} = Array;
const arr = from('hi');
_atMaybeArray(arr).call(arr, -1);
_findLastMaybeArray(arr).call(arr, p => p);
_copyWithinMaybeArray(arr).call(arr, 0, 1);