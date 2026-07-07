import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.dom-collections.entries";
import "core-js/modules/web.dom-collections.keys";
// a BRANCHING static receiver in member form enumerates its branches like the destructure twin
// already did: each resolved branch's STATIC earns a side-effect import (the typeless primary
// resolves nothing for static-only keys, so both branches broke on old engines). one operator
// per line, distinct statics attribute a regressed form; the nested ternary flattens all leaves
export const viaTernary = (globalThis.cond ? Array : Iterator).from([1]);
export const viaLogicalOr = (globalThis.maybe || Promise).try;
export const viaNullish = (globalThis.maybe ?? Object).entries({});
export const viaIn = 'groupBy' in (globalThis.cond ? Map : Object);
export const viaNested = (globalThis.cond ? Number : globalThis.deep ? Math : Object).keys;
// a zero-arg IIFE returning the branching receiver flattens through the same walk (the gate is
// the walker's own branching probe, not a node-type test)
export const viaIife = (() => globalThis.cond ? Array : Iterator)().fromAsync;