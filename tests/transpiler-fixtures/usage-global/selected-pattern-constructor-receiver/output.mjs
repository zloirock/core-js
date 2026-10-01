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
// Pair the pattern with both selected sources: a user slot and the realm constructor.
// The user method is preserved, and only the realm branch needs the static polyfill.
function read(flag) {
  let C;
  const own = {
    Map: {
      groupBy: 9
    }
  };
  const source = {
    Map: C
  } = flag ? own : globalThis;
  return [source === (flag ? own : globalThis), typeof C.groupBy];
}
export const result = [read(true), read(false)];