import "core-js/modules/es.string.repeat";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.number.is-nan";
import "core-js/modules/es.number.to-exponential";
import "core-js/modules/es.number.to-fixed";
// on an unannotated binding a type test excludes what its false answer rules out, but a false
// `Number.isNaN` or `Number.isInteger` rules out no number (`1.5` fails `isInteger`), so a member only
// numbers carry keeps its module where the test failed
export function viaEarlyReturn(x) {
  if (Number.isNaN(x)) return;
  return x.toFixed(1);
}
export function viaElse(x) {
  if (Number.isInteger(x)) return null;else return x.toExponential(1);
}