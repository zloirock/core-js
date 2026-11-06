import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _String$raw from "@core-js/pure/actual/string/raw";
// a slot the file WROTE before a pattern read it holds the literal's value or a written one: pure
// guards the read on each candidate the slot may hold, usage-global injects for each - the container
// bound to a literal, the one bound to a named call, and a write under a key the file cannot name,
// which reaches every slot. the Map write owes its constructor entry. a write the read runs ahead of
// never lands under it: that read holds the literal's value alone
const holder = {
  a: Object
};
holder.a = _Map;
const {
  a: viaLiteralHolder
} = holder;
export const fromLiteralHolder = (viaLiteralHolder === Object ? _Object$groupBy : viaLiteralHolder === _Map ? _Map$groupBy : viaLiteralHolder.groupBy.bind(viaLiteralHolder))([1, 2], v => v % 2);
const build = () => ({
  b: Math
});
const yielded = build();
yielded.b = Array;
const {
  b: viaCallHolder
} = yielded;
export const fromCallHolder = (viaCallHolder === Array ? _Array$of : viaCallHolder.of.bind(viaCallHolder))(1);
const keyed = {
  c: Object
};
keyed[key] = String;
const {
  c: viaUnknownKey
} = keyed;
export const fromUnknownKey = (viaUnknownKey === String ? _String$raw : viaUnknownKey.raw.bind(viaUnknownKey))`x`;
const late = {
  d: Object
};
const {
  d: viaLateWrite
} = late;
late.d = _Promise;
export const fromLateWrite = viaLateWrite.withResolvers();