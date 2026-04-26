import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// mixed object/array destructure with rest: each level of the pattern must independently
// track receivers for pure-mode instance polyfill rewrites.
const {
  a: [b, ...c]
} = {
  a: [1, "x", "y"]
};
b.at(0);
_includesMaybeArray(c).call(c, "x");