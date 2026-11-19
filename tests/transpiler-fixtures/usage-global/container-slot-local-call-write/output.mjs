import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A known synchronous call replaces this own slot before its later destructuring read.
// The original Object candidate is dead; pure retains Map with its statics and the actual read.
function install(value) {
  if (value) value.k = Map;
}
const source = {
  k: Object
};
install(source);
export const {
  k: {
    groupBy
  }
} = source;