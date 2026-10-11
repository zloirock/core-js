import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.concat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// A selection this build decides is the operand it yields, held or read in place: a presence test
// the build always answers picks its arm, and a served static left of `||` is the callee. An undecided
// selection keeps both arms.
function toArray(value) {
  return value;
}
export function ternary() {
  const value = typeof Promise != 'undefined' ? 'abc' : [1];
  return value.at(0);
}
export function callee(source) {
  return (Array.from || toArray)(source).includes(1);
}
export function undecided() {
  return (globalThis.flag ? 'abc' : [1]).concat('d');
}