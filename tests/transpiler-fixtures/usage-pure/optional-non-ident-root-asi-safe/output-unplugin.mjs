var _ref;
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const obj = { foo: [1] };
console.log('A')
null == (_ref = obj.foo) ? void 0 : _atMaybeArray(_ref).call(_ref, -1);