import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
const keys = Object.keys({});
_includesMaybeArray(keys).call(keys, "a");