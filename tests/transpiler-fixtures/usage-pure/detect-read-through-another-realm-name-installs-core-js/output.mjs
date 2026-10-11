import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
import _WeakSet from "@core-js/pure/actual/weak-set";
// a detect read through another realm name than its write still feeds that write after an explicit write of the
// slot: core-js wins it exactly as in the same-name spelling, whichever side the bare name or a realm member
// spells. a wrapper of the slot and a read after the patch stay the user's
_globalThis.WeakSet = UserWeakSet;
WeakSet = _WeakSet;
_globalThis.Promise = UserPromise;
_self.Promise = _Promise;
_self.Map = UserMap;
Map = _Map;
Set = UserSet;
window.Set = _Set;
_globalThis.URL = UserURL;
URL = wrap(_self.URL);
export const later = new window.Map();