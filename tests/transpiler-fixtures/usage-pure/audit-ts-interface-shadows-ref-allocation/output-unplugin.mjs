import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref2;
// TS interface declaration creates a scope binding even though it is erased at runtime.
// the injector cannot distinguish runtime from type-only bindings during pre-traversal,
// so the interface name reserves the slot and ref allocation skips to the next available
interface _ref { x: number }
function fn(value: _ref = (_atMaybeArray(_ref2 = []).call(_ref2, 0) as any)) { return value; }
console.log(fn());