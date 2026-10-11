import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a constructor written through a selection one arm of which is a binding a pattern takes off a container
// lands on the slot that binding takes, so a static read back through the container's path reaches the
// written constructor's static
const holder = {
  inner: {
    C: Object
  }
};
const spare = {
  C: Object
};
const {
  inner: held
} = holder;
const picked = flag ? held : spare;
picked.C = Map;
export const grouped = holder.inner.C.groupBy([1], x => x);