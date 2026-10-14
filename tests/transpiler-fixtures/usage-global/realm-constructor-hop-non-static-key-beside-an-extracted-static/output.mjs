import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A static and a non-static key read off a constructor hop of the realm, under a level default the literal
// proves dead: the hop pulls its constructor's family and the static its own module.
const user = {};
const {
  k: {
    Map: {
      groupBy: g,
      0: z
    }
  } = c ? globalThis : user
} = {
  k: globalThis
};
export { g, z };