import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
// A known realm result supplies both the nested instance read and its sibling.
const get = () => globalThis;
const {
  Array: {
    prototype: {
      flat
    },
    isArray
  }
} = get();
export { flat, isArray };