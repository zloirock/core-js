import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Prototype writes retain the target and route constructors where needed. Instance reads
// use the polyfill, including a self-guard before its own write. A compound ||= or ??=
// receives that detect explicitly; &&= keeps its native filled-slot condition.
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