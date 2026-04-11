import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
const {
  a: [b, ...c]
} = {
  a: [1, "x", "y"]
};
b.at(0);
_includesMaybeArray(c).call(c, "x");