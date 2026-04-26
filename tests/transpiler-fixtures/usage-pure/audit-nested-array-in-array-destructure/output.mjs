import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// array-pattern destructure with nested array-pattern: each level of nesting must
// track its own receiver for pure-mode polyfill rewrites.
const {
  a: [[b]]
} = {
  a: [["hello"]]
};
_atMaybeString(b).call(b, -1);