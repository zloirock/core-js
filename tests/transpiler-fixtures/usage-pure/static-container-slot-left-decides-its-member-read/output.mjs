import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
var _ref;
// a member read off a `||` / `??` whose left reads a static container's slot holding a constructor - spelled bare
// or read off the realm - never runs the right: it reads the static off that constructor and imports nothing for
// the right. a slot a write may reach keeps the selection and its guard
const box = {
  U: _Map
};
const realm = {
  M: _Map
};
const held = {
  M: _Map
};
if (_globalThis.reset) held.M = null;
export const viaSlot = _Map$groupBy;
export const viaRealmSlot = _Map$groupBy;
export const viaHeldSlot = (_ref = held.M || Object, _ref === Object ? _Object$groupBy : _ref.groupBy);