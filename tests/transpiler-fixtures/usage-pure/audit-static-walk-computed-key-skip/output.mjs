import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// computed key inside a static-wrapper ObjectExpression: `{ [dynamicKey]: Array }` where
// `dynamicKey` is a const-bound string literal. the destructure path must fold the key
// to its static value so descent into `Array` resolves and `from` dispatches statically
const dynamicKey = 'a';
const wrapper = {
  [dynamicKey]: Array
};
const from = _Array$from;
from;
_atMaybeArray(_ref = [1]).call(_ref, 0);