import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// A stored Proxy result must retain instance-method polyfills.
const held = new Proxy(values, handler);
_findLastMaybeArray(held).call(held, predicate);