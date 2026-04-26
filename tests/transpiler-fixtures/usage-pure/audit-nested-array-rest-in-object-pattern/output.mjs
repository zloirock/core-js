import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// object-pattern destructure containing a nested array-rest pattern: the rest binding
// still resolves to an array for instance polyfill dispatch.
const {
  a: [, ...rest]
} = {
  a: [1, "hello", "world"]
};
_atMaybeArray(rest).call(rest, -1);