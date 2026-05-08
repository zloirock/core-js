import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
var _ref;
// Same method name across different static dispatchers tests nth-occurrence ordering:
// `Array.from`, `Object.fromEntries`, both share `from` substring but distinct callees
const a = _Array$from(x);
const b = _Object$fromEntries(p);
const c = _atMaybeArray(_ref = _Array$from(y)).call(_ref, -1);