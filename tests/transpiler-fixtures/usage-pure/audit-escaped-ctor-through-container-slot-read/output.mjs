import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// a constructor handed OUT through a container read escapes just as the container itself does:
// reads through wherever the value lands are unresolvable, so the reference has to carry the
// constructor's statics. the reads that stay home keep the bare constructor entry - the slot read
// that is only a receiver, and the static read that resolves where it stands
const box = {
  Base: _Map,
  Kept: _Set,
  Home: _WeakMap
};
hand(box.Base);
use(new box.Kept());
use(_nameMaybeFunction(box.Home));