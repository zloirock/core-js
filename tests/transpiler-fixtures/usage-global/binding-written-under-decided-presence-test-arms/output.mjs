import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
export function arms() {
  let value;
  if (typeof Promise != 'undefined') {
    value = 'abc';
  } else {
    value = [1];
  }
  return value.concat('d');
}