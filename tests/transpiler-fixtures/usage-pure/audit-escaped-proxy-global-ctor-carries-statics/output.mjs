import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// a constructor read off the proxy-global surface escapes exactly as the bare spelling does: the
// value lands where no read resolves, so the reference has to carry the constructor's statics.
// the reads that stay home keep the bare constructor entry - the `new` callee and the static read
hand(_Map);
use(new _Set());
use(_nameMaybeFunction(_WeakMap));