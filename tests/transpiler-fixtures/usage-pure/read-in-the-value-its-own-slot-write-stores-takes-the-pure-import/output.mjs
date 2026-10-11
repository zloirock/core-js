import _AggregateError from "@core-js/pure/actual/aggregate-error";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Reflect from "@core-js/pure/actual/reflect";
import _Set from "@core-js/pure/actual/set";
import _Symbol from "@core-js/pure/actual/symbol";
import _URL from "@core-js/pure/actual/url";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
// a read of a global in the value its own slot write stores runs before that write, so it takes the
// pure import whichever way the write is spelled - bare or through a realm, a detect or a wrapper - and
// a detect takes it even after an earlier write of the slot, bare or through a realm: core-js wins every
// detect. a read after the write reads the user's slot
Set = _Set;
Map = wrap(_Map);
_globalThis.WeakMap = wrap(_WeakMap);
_globalThis.Symbol = _Symbol;
_globalThis.Promise = _Promise;
_globalThis.WeakSet = UserWeakSet;
_globalThis.WeakSet = _WeakSet;
Reflect = UserReflect;
Reflect = _Reflect;
_globalThis.URL = UserURL;
URL = _URL;
AggregateError = _AggregateError;
export const later = new WeakMap();