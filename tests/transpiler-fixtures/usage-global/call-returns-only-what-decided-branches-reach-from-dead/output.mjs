import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.string.includes";
function dead() {
  if (typeof Promise == 'undefined') return [1];
  return 'abc';
}
export const fromDead = dead().includes('b');