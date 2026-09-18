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
