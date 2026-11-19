import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An unknown key leaves the independent Object default responsible for its static.
const {
  [key()]: {
    groupBy
  } = Object
} = source;
use(groupBy);