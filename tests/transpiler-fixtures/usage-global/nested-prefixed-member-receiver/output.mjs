import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// The prefix and both getter reads belong to one extraction, including assignment hosts.
const {
  list: {
    at
  }
} = (note(), owner.value);
let includes;
({
  list: {
    includes
  }
} = (note(), owner['value']));