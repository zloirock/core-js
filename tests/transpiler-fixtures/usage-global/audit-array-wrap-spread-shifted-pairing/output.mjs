import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.aggregate-error.cause";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.entries";
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
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.typed-array.from";
import "core-js/modules/es.typed-array.of";
import "core-js/modules/es.typed-array.iterator";
import "core-js/modules/es.typed-array.at";
import "core-js/modules/es.typed-array.copy-within";
import "core-js/modules/es.typed-array.entries";
import "core-js/modules/es.typed-array.every";
import "core-js/modules/es.typed-array.fill";
import "core-js/modules/es.typed-array.filter";
import "core-js/modules/es.typed-array.find";
import "core-js/modules/es.typed-array.find-index";
import "core-js/modules/es.typed-array.find-last";
import "core-js/modules/es.typed-array.find-last-index";
import "core-js/modules/es.typed-array.for-each";
import "core-js/modules/es.typed-array.includes";
import "core-js/modules/es.typed-array.index-of";
import "core-js/modules/es.typed-array.join";
import "core-js/modules/es.typed-array.keys";
import "core-js/modules/es.typed-array.last-index-of";
import "core-js/modules/es.typed-array.map";
import "core-js/modules/es.typed-array.reduce";
import "core-js/modules/es.typed-array.reduce-right";
import "core-js/modules/es.typed-array.reverse";
import "core-js/modules/es.typed-array.set";
import "core-js/modules/es.typed-array.slice";
import "core-js/modules/es.typed-array.some";
import "core-js/modules/es.typed-array.sort";
import "core-js/modules/es.typed-array.species";
import "core-js/modules/es.typed-array.subarray";
import "core-js/modules/es.typed-array.to-locale-string";
import "core-js/modules/es.typed-array.to-reversed";
import "core-js/modules/es.typed-array.to-sorted";
import "core-js/modules/es.typed-array.to-string";
import "core-js/modules/es.typed-array.to-string-tag";
import "core-js/modules/es.typed-array.values";
import "core-js/modules/es.typed-array.with";
import "core-js/modules/es.uint8-array.from-base64";
import "core-js/modules/es.uint8-array.from-hex";
import "core-js/modules/es.uint8-array.set-from-base64";
import "core-js/modules/es.uint8-array.set-from-hex";
import "core-js/modules/es.uint8-array.to-base64";
import "core-js/modules/es.uint8-array.to-hex";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-exception.constructor";
import "core-js/modules/web.dom-exception.stack";
import "core-js/modules/web.dom-exception.to-string-tag";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
import "core-js/modules/web.structured-clone";
// a spread BEFORE an array-wrap slot shifts every later runtime position, so the pattern slot
// no longer pairs EXACTLY with the literal init element at the same index - but every static
// element from the spread on is still a POSSIBLE slot value, and inject-if-might is sound here:
// a member read off the alias injects the union's method-aware set as a MAYBE. the type channel
// still must not NARROW a spread-shifted binding: `.at` on a foreign runtime receiver keeps BOTH
// the array and the string leg (narrowing to the array leg alone under-injects the string polyfill)
let tail = [{}, {}];

// ctor-alias member channel: M MIGHT be the global Map (a length-1 spread pairs it), so the
// method-aware maybe-set injects
const [m0, {
  Map: M
}] = [...tail, globalThis];
export const viaCtorAlias = M.groupBy([1, 2], v => v);

// symbol-alias channel: S MIGHT be the global Symbol - the well-known-symbol modules and the
// ctor modules inject
const [s0, {
  Symbol: S
}] = [...tail, globalThis];
export const viaSymbolAlias = [1, 2][S.iterator];

// ctor CONSTRUCTION through the maybe-alias: the single static candidate classifies the receiver,
// so the constructor modules inject; TWO distinct candidates stay ambiguous and inject nothing
const [c1, {
  Map: MC
}] = [...tail, globalThis];
export const viaCtorConstruct = new MC(ctorSeed);
const [c2, {
  WeakSet: WS
}] = [...tail, globalThis, otherHolder];
export const viaTwoCandidatesBail = new WS();

// type channel: A is not PROVABLY Array, `.at` injects both the array and the string leg
const [a0, {
  Array: A
}] = [...tail, globalThis];
export const viaTypeNarrow = new A().at(0);

// deep array-wrap layers: the spread shifts the INNER level - the maybe-union recurses the same way
const [[i0, {
  Iterator: I
}]] = [[...tail, globalThis]];
export const viaDeepSpread = I.range(0, 3);

// spread AT the slot bails too (position is runtime-determined from the spread on)
let head = [globalThis];
const [{
  Promise: P
}] = [...head];
export const viaSpreadAt = P.allSettled([]);

// control: a spread strictly AFTER the slot keeps earlier positions static - the sound slot
// resolves and its constructor modules inject; the sibling slot AT the spread stays unresolvable
const [{
  Set: C
}, {
  WeakMap: W
}] = [globalThis, ...tail];
export const viaSpreadAfter = new C(afterSeed);
export const viaSlotAtSpread = new W();

// a UNION candidate contributes each arm: an all-proxy ternary or `||` collapses to the one
// canonical global; a diverging union still injects by its resolving arm (inject-if-might);
// an `&&` guard stays whole - its falsy LEFT is the expression's value, never collapsible
const [u1, {
  Reflect: RA
}] = [...tail, pick ? globalThis : self];
export const viaShiftedUnionArms = RA.ownKeys({});
const [u2, {
  Proxy: PD
}] = [...tail, pick ? globalThis : foreignHolder];
export const viaShiftedDivergingArm = new PD({}, {});
const [u3, {
  DataView: DV
}] = [...tail, cond && globalThis];
export const viaShiftedAndStaysWhole = new DV(buf);

// arms recurse through NESTED unions; a sequence candidate resolves through its tail; the
// assignment-form destructure pairs the same way the declarator form does
const [, {
  Uint8Array: U8
}] = [...tail, deep ? deeper ? globalThis : self : window];
export const viaNestedUnionArms = U8.fromBase64;
const [, {
  structuredClone: SC
}] = [...tail, (mark(), globalThis)];
export const viaSequenceCandidate = SC;
let AB;
[, {
  DOMException: AB
}] = [...tail, globalThis];
export const viaAssignmentForm = new AB('x');

// a slot BEFORE the spread pairs exactly while its sibling AFTER pairs as a maybe - both inject;
// a spread with NO static candidates enumerates nothing and injects nothing
const [{
  Float16Array: F16
}, {
  AggregateError: AG
}] = [globalThis, ...tail, globalThis];
export const viaMixedPositions = [F16, new AG([], 'x')];
const [, {
  Atomics: AT
}] = [...tail];
export const viaNoCandidates = AT.pause;