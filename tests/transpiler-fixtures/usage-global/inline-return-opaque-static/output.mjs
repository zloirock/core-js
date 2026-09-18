import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The loop keeps the call result opaque to static extraction. Its actual member read still
// needs the possible Map namespace, even though the constructor itself stays local.
export const value = (() => {
  while (flag) return Map;
  return custom;
})().groupBy([1, 2, 3], value => value % 2);