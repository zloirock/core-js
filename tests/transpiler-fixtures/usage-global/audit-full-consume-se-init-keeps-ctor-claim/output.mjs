import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.async-iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// usage-global regression guard for the pure-flavor lift of a fully-consumed destructure whose
// init carries side effects: this method only ADDS imports and never rewrites the destructure, so
// the whole matrix must stay import-only whatever the pure receiver claim decides
let e1 = 0;
const {
  groupBy
} = globalThis[e1++, 'Map'];
export const r1 = [typeof groupBy, e1];
let e2 = 0;
const {
  allSettled
} = (e2++, globalThis).Promise;
export const r2 = [typeof allSettled, e2];
let e3 = 0;
const {
  values
} = globalThis[e3++, 'Object'];
export const r3 = [typeof values, e3];
let e4 = 0;
let any;
({
  any
} = globalThis[e4++, 'Promise']);
export const r4 = [typeof any, e4];
let e5 = 0;
for (const {
  ownKeys
} = globalThis[e5++, 'Reflect']; false;) break;
export const r5 = [e5];
let e6 = 0;
const {
  asyncIterator
} = (e6++, globalThis[e6++, 'Symbol']);
export const r6 = [typeof asyncIterator, e6];
const {
  fromEntries
} = globalThis['Object'];
export const r7 = [typeof fromEntries];