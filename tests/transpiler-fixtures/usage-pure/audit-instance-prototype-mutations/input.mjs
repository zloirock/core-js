// Prototype writes retain the target and route constructors where needed. Instance reads
// use the polyfill, including a self-guard before its own write. A compound ||= or ??=
// receives that detect explicitly; &&= keeps its native filled-slot condition.
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
