import _Array$from from "@core-js/pure/actual/array/from";
import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _includes from "@core-js/pure/actual/instance/includes";
_Array$from(_filterMaybeArray(arr).call(arr, x => _includes(x).call(x, 1)));