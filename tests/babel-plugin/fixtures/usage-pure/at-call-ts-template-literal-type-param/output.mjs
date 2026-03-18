import _atMaybeString from "@core-js/pure/actual/string/instance/at";
function foo(x: `prefix_${string}`) {
  _atMaybeString(x).call(x, -1);
}