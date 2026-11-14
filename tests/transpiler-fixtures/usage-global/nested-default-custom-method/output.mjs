import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.entries";
import "core-js/modules/web.dom-collections.entries";
// A defaulted slot and its custom method getter each run once.
const source = {
  get list() {
    effect('list');
    return receiver;
  }
};
const {
  list: {
    entries
  } = Object
} = source;
use(entries.call(receiver));