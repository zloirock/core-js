import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// Keep the source guard and distinguish realm values from user properties.
function inner() {
  return globalThis;
}
function outer() {
  return inner();
}
export const r = outer().window?.Array?.from([3]);