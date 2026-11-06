import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.values";
import "core-js/modules/web.dom-collections.entries";
import "core-js/modules/web.dom-collections.values";
// Capturing a parameter keeps the following body bindings in their own slots.
export function read({
  values
}, state) {
  let entries, status;
  ({
    data: {
      entries
    },
    status
  } = state);
  return [values, entries, status];
}