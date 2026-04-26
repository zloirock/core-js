import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// nested object-pattern destructure inside an array pattern: each inner binding must
// track its own indexed receiver for the pure-mode instance polyfill rewrites.
const [{
  a
}, {
  b
}] = [{
  a: "x"
}, {
  b: [1]
}];
_atMaybeString(a).call(a, 0);
_includesMaybeArray(b).call(b, 1);