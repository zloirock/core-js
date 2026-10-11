import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A read follows at most 64 writes of one binding: `followed` holds the constructor its reaching write stores,
// and its static is injected; `unfollowed`, written once more, names nothing, and its read injects nothing.
let followed = Map,
  unfollowed = Object;
// 64 writes, eight rows of eight
followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map;
followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map;
followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map;
followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map;
followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map;
followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map;
followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map;
followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map, followed = Map;
// 65 writes: the same eight rows and one more
unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object;
unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object;
unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object;
unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object;
unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object;
unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object;
unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object;
unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object, unfollowed = Object;
unfollowed = Object;
export const r = [followed.groupBy(list, pick), unfollowed.groupBy(list, pick)];