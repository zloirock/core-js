import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
function nested(source) {
  {
    if (typeof Promise != 'undefined') {
      return 'abc';
    }
  }
  return source;
}
export const fromNested = nested(input).concat('d');