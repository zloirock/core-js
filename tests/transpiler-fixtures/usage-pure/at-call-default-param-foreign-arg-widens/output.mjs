import _at from "@core-js/pure/actual/instance/at";
// the parameter has an array default, but a call site passes a non-classifiable argument
// (`f(foreign)`) that overrides the default at runtime, so `x` is not necessarily the array -
// the `.at` receiver must widen to the generic helper instead of the array-specific Maybe
function f(x = [1, 2, 3]) {
  return _at(x).call(x, 0);
}
declare const foreign: any;
f(foreign);