import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _Array$from from "@core-js/pure/actual/array/from";
var _ref, _ref2, _ref3;
// five Array.from references: one as receiver, four as args. only the receiver gets consumed
// by the filter/flat/flatMap substitutions, so the remaining four must each find their own slot
_flatMapMaybeArray(_ref = _flatMaybeArray(_ref2 = _filterMaybeArray(_ref3 = _Array$from(s)).call(_ref3, _Array$from)).call(_ref2, _Array$from)).call(_ref, _Array$from, _Array$from);