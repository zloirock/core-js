// A read follows at most 64 writes of one binding: `followed` holds the constructor its reaching write stores,
// and its static is injected; `unfollowed`, written once more, names nothing, and its read injects nothing.
let followed = Map, unfollowed = Object;
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
