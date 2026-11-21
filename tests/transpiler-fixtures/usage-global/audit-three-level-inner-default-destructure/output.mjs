import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The inner default supplies Map.groupBy. A caller can supply both properties.
function f({
  a: {
    b: {
      entries,
      groupBy
    } = Map
  } = {
    b: undefined
  }
} = {
  a: undefined
}) {
  return [entries, groupBy];
}
export { f };
export const groups = f()[1]([3], x => x).get(3);
export const supplied = f({
  a: {
    b: {
      entries: 1,
      groupBy: 2
    }
  }
});