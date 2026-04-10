var _ref;
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
declare const arr: { foo: { bar: number[] } };
const x = (arr == null ? void 0 : _atMaybeArray(_ref = arr.foo.bar).call(_ref, 0))! + 5;