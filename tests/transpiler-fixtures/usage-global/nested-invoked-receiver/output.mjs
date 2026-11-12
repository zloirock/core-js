import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// Optional calls and tags remain whole user receivers, preserving their this value.
const {
  list: {
    at
  }
} = owner.make?.();
const {
  list: {
    includes
  }
} = (note(), owner.tag`source`);