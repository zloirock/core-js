import _atInstanceProperty from "@core-js/pure/actual/instance/at";
function foo(x: `prefix_${string}`) {
  _atInstanceProperty(x).call(x, -1);
}