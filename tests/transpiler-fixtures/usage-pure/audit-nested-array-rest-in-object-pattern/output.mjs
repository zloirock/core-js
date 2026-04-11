import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const {
  a: [, ...rest]
} = {
  a: [1, "hello", "world"]
};
_atMaybeArray(rest).call(rest, -1);