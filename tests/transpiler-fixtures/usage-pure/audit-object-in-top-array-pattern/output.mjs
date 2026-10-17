import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// object-pattern at the top of an array-pattern destructure: the inner pattern keys
// still produce their own pure-mode polyfill rewrites.
const [{
  a
}] = [{
  a: "hello"
}];
_atMaybeString(a).call(a, -1);