import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
declare const arr: { foo: { bar: number[] } };
const x = (arr == null ? void 0 : _atMaybeArray(_ref = arr.foo.bar).call(_ref, 0)) as number + 5;