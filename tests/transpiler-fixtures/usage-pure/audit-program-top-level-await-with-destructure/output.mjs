import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// The destructured method and the receiver memo both survive module suspension.
const from = _Array$from;
const last = _atMaybeArray(_ref = await from([4])).call(_ref, -1);
export { last };