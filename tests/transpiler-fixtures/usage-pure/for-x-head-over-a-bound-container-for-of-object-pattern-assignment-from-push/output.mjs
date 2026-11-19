import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Map from "@core-js/pure/actual/map";
// A head whose LEFT is a pattern unpacks the element it binds, and unpacking is a read: it re-homes what its own leaves bind,
// exactly as the declarator twin does.
const out = [];
// a write through the head's own binding lands AFTER the iterable was read: a head reads its source
// once per ENTRY, so the literal the element spells is what every pass of that entry binds
const throughHead = {
  w: Array
};
for (const {
  from
} of [{
  from: _Array$from
}]) {
  throughHead.w = _Map;
  _pushMaybeArray(out).call(out, typeof from);
}
export { out };