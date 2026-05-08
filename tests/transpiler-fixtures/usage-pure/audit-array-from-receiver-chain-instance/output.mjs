import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2, _ref3;
// Polyfilled call site is itself the receiver of an instance method. The instance
// methods chained off `Array.from(input)` should each polyfill independently, and the
// `Array.from(input)` call must NOT be pushed into a side-effect sequence wrapper
// (which would double-invoke the polyfilled emit).
_atMaybeArray(_ref = _Array$from(input)).call(_ref, -1);
_findLastMaybeArray(_ref2 = _Array$from(other)).call(_ref2, x => x);
_flatMaybeArray(_ref3 = _Array$from(third)).call(_ref3);