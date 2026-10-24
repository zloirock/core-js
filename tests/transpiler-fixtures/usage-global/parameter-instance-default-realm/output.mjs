import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// A realm default supplies its constructor's prototype as the instance receiver.
// Supplied arguments bypass the default and keep their own receiver families and properties.
export const read = ({
  Array: {
    prototype: {
      includes,
      flat
    }
  }
} = globalThis) => [includes, flat];