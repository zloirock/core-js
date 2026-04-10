import _atMaybeString from "@core-js/pure/actual/string/instance/at";
declare const x: string | number[];
function outer() {
  if (typeof x === "string") {
    function inner() {
      return _atMaybeString(x).call(x, -1);
    }
  }
}