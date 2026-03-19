import _at from "@core-js/pure/actual/string/at";
function foo(x: `prefix_${string}`) {
  _at(x).call(x, -1);
}