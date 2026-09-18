import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// prototype (instance-property) mutations: the mutated key's INSTANCE entry is imported up
// front, so core-js caches its own implementation from the pristine prototype BEFORE the
// patch statement runs and keeps serving the polyfill across the bundle. A COMPOUND patch has no
// read to name: `||=` / `??=` test the slot through the operator, so the detect is spelled FOR them
// and the write stays conditional; `&&=` writes only where the slot is filled and is left alone.
// patch statement runs and keeps serving the polyfill across the bundle. a read that NAMES the
// patched slot keeps its dispatch too: core-js's own method IS the built-in as far as this file is
// concerned, and it OUTRANKS a third-party patch of the same slot - so the self-guard idiom below
// answers from the polyfill and its `||` fallback correctly never fires. the receiver routes
// through the ordinary identifier machinery (runtime-safe on missing globals); keys with no
// pure instance entry (iterator helpers, custom keys) just route through unchanged
_Iterator.prototype.customDrop = patch1;
_Map.prototype.getOrUpsert ||= patch2;
export const m = new _Map();
_Set.prototype.intersection = _Set.prototype.intersection || patch3;
String.prototype.at = _atMaybeString(String.prototype) || patch4;
export const r1 = _at(s).call(s, 1);
Array.prototype.flatMap ||= _flatMapMaybeArray(Array.prototype) || patch5;
// proxy-global chains name the same prototype through the global object
_globalThis.String.prototype.padStart = patch6;
// a symbol-keyed prototype patch shares the polyfilled symbol identity with the dispatch
String.prototype[_Symbol$iterator] = patch7;