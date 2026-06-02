import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// The `"number"` case reassigns `x` but ends in `return`, so it cannot fall through into the
// `"string"` case. Its mutation therefore does not invalidate the `"string"` narrow, and `x` is a
// string there, so `.at` gets the string-specific polyfill.
declare const mixed: string | number[];
function g(x: string | number[]) {
  switch (typeof x) {
    case "number":
      x = mixed;
      return;
    case "string":
      _atMaybeString(x).call(x, 0);
  }
}