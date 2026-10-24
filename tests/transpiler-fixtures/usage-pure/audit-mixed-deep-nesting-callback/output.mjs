import _Array$from from "@core-js/pure/actual/array/from";
import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _includes from "@core-js/pure/actual/instance/includes";
// deeply nested callback expressions mixing polyfilled built-ins: each nested call
// site is rewritten independently with the right polyfill alias.
_Array$from(_filterMaybeArray(arr).call(arr, x => _includes(x).call(x, 1)));