// a compound assignment DERIVES a new value - not the identity self-restore idiom - so the
// slot write records and the name deopts; the plain `=` self-copy twin stays exempted
Promise += globalThis.Promise;
export const compound = Promise.try(() => 1);
Map = globalThis.Map;
export const identity = Map.groupBy([1], x => x);
// the logical-and twin either keeps the current value or installs the same slot's value -
// still the exempted identity idiom
Iterator &&= globalThis.Iterator;
export const andIdentity = Iterator.range(0, 3);
Number ||= globalThis.Number;
export const orIdentity = Number.isFinite(1);
JSON ??= globalThis.JSON;
export const nullishIdentity = JSON.rawJSON('1');
export const control = Array.from('ab');
