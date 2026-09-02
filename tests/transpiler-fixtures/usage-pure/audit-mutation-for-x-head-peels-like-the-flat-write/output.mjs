import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a for-x head is classified through the same wrapper peel every other write is, so the
// parenthesized spelling taints `Array.from` exactly like the bare one - judging the raw node type
// answered differently on the two parsers, and only the estree leg keeps the paren node. `for-in`
// yields KEYS, so iterating a container hands its value to nobody and the read below keeps its
// substitution
for (Array.from of xs) {
  void 0;
}
Array.from(src);
const box = {
  Map: _Map
};
for (const k in box) void k;
_Map$groupBy(src, it => it);