import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.values";
import "core-js/modules/web.dom-collections.values";
// The method read precedes its live forward default and the following binding.
// The default cannot replace a missing native instance polyfill on a supplied array.
export function read(factory, key) {
  const {
    [(key(), 'values')]: value = after,
    after
  } = factory();
  return [value, after];
}