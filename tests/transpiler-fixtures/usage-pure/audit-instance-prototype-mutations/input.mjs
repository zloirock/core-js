// prototype (instance-property) mutations: the mutated key's INSTANCE entry is imported up
// front, so core-js initializes from the pristine prototype and caches its own
// implementation BEFORE the patch statement runs - dispatch helpers keep serving the
// core-js polyfill in this and every other file of the bundle. the receiver routes through
// the ordinary identifier machinery (`_Map.prototype.x` - runtime-safe on missing globals);
// keys without a pure instance entry (iterator helpers, custom keys) just route
Iterator.prototype.customDrop = patch1;
Map.prototype.getOrUpsert ||= patch2;
export const m = new Map();
Set.prototype.intersection = Set.prototype.intersection || patch3;
String.prototype.at = String.prototype.at || patch4;
export const r1 = s.at(1);
Array.prototype.flatMap ||= patch5;
// proxy-global chains name the same prototype through the global object
globalThis.String.prototype.padStart = patch6;
// a symbol-keyed prototype patch shares the polyfilled symbol identity with the dispatch
String.prototype[Symbol.iterator] = patch7;
