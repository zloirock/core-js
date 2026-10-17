import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Map from "@core-js/pure/actual/map";
// A head whose LEFT is a pattern unpacks the element it binds, and unpacking is a read: it re-homes what its own leaves bind,
// exactly as the declarator twin does.
const out = [];
// NEGATIVE: a slot the source WRITES holds whatever was written, so the walk owes the live read
const written = {
  w: Array
};
written.w = _Map;
for (const {
  from
} of [written.w]) _pushMaybeArray(out).call(out, typeof from);
export { out };