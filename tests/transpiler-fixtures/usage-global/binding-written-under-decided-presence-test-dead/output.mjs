import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.string.includes";
export function dead() {
  let value = 'abc';
  if (typeof Promise == 'undefined') value = [1];
  return value.includes('b');
}