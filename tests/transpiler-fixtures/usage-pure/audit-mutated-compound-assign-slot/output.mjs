import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _JSON$rawJSON from "@core-js/pure/actual/json/raw-json";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Number$isFinite from "@core-js/pure/actual/number/is-finite";
// a compound assignment DERIVES a new value - not the identity self-restore idiom - so the
// slot write records and the name deopts; the plain `=` self-copy twin stays exempted
Promise += _globalThis.Promise;
export const compound = Promise.try(() => 1);
Map = _Map;
export const identity = _Map$groupBy([1], x => x);
// the logical-and twin either keeps the current value or installs the same slot's value -
// still the exempted identity idiom
Iterator &&= _Iterator;
export const andIdentity = _Iterator.range(0, 3);
Number ||= _globalThis.Number;
export const orIdentity = _Number$isFinite(1);
JSON ??= _globalThis.JSON;
export const nullishIdentity = _JSON$rawJSON('1');
export const control = _Array$from('ab');