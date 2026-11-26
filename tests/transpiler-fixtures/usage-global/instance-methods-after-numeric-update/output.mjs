import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
export function updated(value) {
  value++;
  return [value.at, value.flatMap];
}
export function conditional(value, change) {
  if (change) --value;
  return value.includes;
}