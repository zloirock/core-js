import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
import _WeakMap from "@core-js/pure/actual/weak-map";
// Prototype patches retain pure instance dispatch; whole-constructor writes route later reads.
// A detect read feeding a write still selects core-js ahead of that installation.
// After a custom-key install, the patched realm slot supplies its subsequent call.
String.prototype.padStart = shimPadStart;
export const r1 = _padStartMaybeString(s).call(s, 3, '0');
window.Promise = _Promise;
export const r2 = new Promise(res => res(1));
export const r3 = Promise.try(fn);
_globalThis.Map = ShimMap;
export const r4 = new Map();
// a ctor-slot write through ANY proxy deopts the name without pinning anything - nothing
// of a deopted name is ever substituted, so there is no ponyfill to protect - even
// when nothing in THIS file uses the constructor
window.WeakMap = _WeakMap;
Map.customExt = _Map.customExt || customImpl;
export const r5 = Map.customExt(x);
// repeated mutations of one key all land on the same routed object, last write wins
_Iterator.from ||= shimIterFrom;
_Iterator.from = hardOverride;
export const r6 = _Iterator.from(it);