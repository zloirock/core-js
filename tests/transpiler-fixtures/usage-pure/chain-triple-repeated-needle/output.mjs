import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _Array$from from "@core-js/pure/actual/array/from";
var _ref;
// three Array.from references in one expression - tests nth-adjustment in nested composition
_filterMaybeArray(_ref = _Array$from(a)).call(_ref, _Array$from).reduce(_Array$from, 0);