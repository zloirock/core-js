import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// destructure default in static destructure: `const { from = () => [] } = Array`. the
// default is unreachable (Array is non-nullable), but the binding must still register
// as an Array.from alias so subsequent instance methods narrow to array-specific entries
const from = _Array$from === void 0 ? () => [] : _Array$from;
const arr = from('hi');
_atMaybeArray(arr).call(arr, -1);
_findLastMaybeArray(arr).call(arr, p => p);
_copyWithinMaybeArray(arr).call(arr, 0, 1);