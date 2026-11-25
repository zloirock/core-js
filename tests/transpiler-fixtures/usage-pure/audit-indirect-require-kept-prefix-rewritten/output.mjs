import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref, _ref2;
// Calls in each require prefix need their own ponyfill, including the literal receivers.
// Each user-written module load must follow that prefix.
let arr = [1];
_atMaybeArray(arr).call(arr, 0);
require("core-js/modules/es.array.includes");
_atMaybeArray(_ref = [1]).call(_ref, 0);
require("core-js/modules/es.array.from");
_atMaybeArray(_ref2 = [2]).call(_ref2, 1);
require("core-js/modules/es.array.of");
export const r = arr;