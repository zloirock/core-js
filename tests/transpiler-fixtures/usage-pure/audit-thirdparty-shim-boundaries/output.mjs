import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// shim classes with their own routing rules:
// - a PROTOTYPE shim is invisible to the static mutation model - instance dispatch keeps the
//   runtime-guarded polyfill helper (long-standing pure instance semantics)
// - a WHOLE-CONSTRUCTOR replacement through the global object patches the real global slot,
//   while constructor and static reads keep the ponyfill - the shim becomes dead code and
//   core-js serves the calls
// - a CUSTOM-key shim routes like any mutation: write, read and cleanup share one object
String.prototype.padStart = shimPadStart;
export const r1 = _padStartMaybeString(s).call(s, 3, '0');
window.Promise = window.Promise || ShimPromise;
export const r2 = new _Promise(res => res(1));
export const r3 = _Promise$try(fn);
_globalThis.Map = ShimMap;
export const r4 = new _Map();
// a ctor-slot write through ANY proxy pins the constructor's own entry up front, so
// core-js modules loading later in the bundle initialize from the pristine global - even
// when nothing in THIS file uses the constructor
window.WeakMap = window.WeakMap || ShimWeakMap;
_Map.customExt = _Map.customExt || customImpl;
export const r5 = _Map.customExt(x);
// repeated mutations of one key all land on the same routed object, last write wins
_Iterator.from ||= shimIterFrom;
_Iterator.from = hardOverride;
export const r6 = _Iterator.from(it);