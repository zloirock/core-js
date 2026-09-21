import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A captured container keeps its identity, but its slots remain mutable.
// Pure leaves the nested read native; Map's namespace supplies its own static.
const inner = {
  k: Object
};
const wrapper = {
  part: inner
};
inner.k = Map;
const {
  part: {
    k: {
      groupBy
    }
  }
} = wrapper;
use(groupBy([1], x => x));