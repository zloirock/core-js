import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.get-own-property-names";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.reject";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.math.hypot";
import "core-js/modules/es.math.sign";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.number.parse-float";
import "core-js/modules/es.number.parse-int";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// the guard's kept receiver reaches the channel in three spellings, and the collapse verdict must be
// the same in all of them: an ALIAS binding, a DESTRUCTURED extraction, and a TS-wrapped expression.
// what decides it is the hop, not the spelling - a hop core-js ponyfills collapses and the guard goes
// with it, one it does not keeps both the raw read and the guard, and an unresolvable hop in the
// MIDDLE renders the shared plan. a reassigned alias stays raw whatever it currently holds.
// one static per row, so a row that changes verdict shows up in the import set.

// --- alias spellings ---
const aliasWindow = globalThis.window;
let k1;
export const aliasOfUnponyfilled = (k1 = aliasWindow)?.Map.groupBy([1, 2], v => v % 2);
const aliasSelf = globalThis.self;
let k2;
export const aliasOfPonyfilled = (k2 = aliasSelf)?.Object.entries({
  a: 1
});
const aliasRoot = globalThis;
let k3;
export const aliasRootThenHop = (k3 = aliasRoot.self)?.Math.hypot(3, 4);
const aliasFactory = () => globalThis.self;
let k4;
export const aliasThroughCall = (k4 = aliasFactory())?.Reflect.ownKeys({
  b: 2
});
let reassigned = globalThis.window;
reassigned = globalThis.self;
let k5;
export const aliasReassigned = (k5 = reassigned)?.Number.parseFloat('1.5');
const aliasNested = globalThis.window.self;
let k6;
export const aliasOfMidHopNav = (k6 = aliasNested)?.Array.of(5);

// --- destructured spellings ---
const {
  self: extracted
} = globalThis;
export const destructuredHop = extracted.Array.from([1, 2]);
const {
  window: extractedWindow
} = globalThis;
export const destructuredUnponyfilled = extractedWindow?.Object.values({
  c: 3
});
const {
  self: {
    window: extractedNested
  }
} = globalThis;
export const destructuredNested = extractedNested?.Object.fromEntries([['d', 4]]);
const [{
  self: fromArray
}] = [globalThis];
export const destructuredThroughArray = fromArray.Promise.resolve(1);
const {
  self: withDefault = globalThis
} = globalThis;
export const destructuredWithDefault = withDefault.Promise.allSettled([]);

// --- TS-wrapped spellings ---
let k7;
export const castInsideAssign = (k7 = globalThis.self as any)?.Math.trunc(6.7);
let k8;
export const castAroundValue = (k8 = globalThis.self as any)?.Number.parseInt('7', 10);
let k9;
// the static stays raw here BY CONSTRUCTION, not by a miss: `Object.keys` only needs the
// polyfill for a PRIMITIVE argument, and an object literal is filtered out of the injection.
// what this row spells is the receiver: a non-null assertion over an unponyfillable hop
export const nonNullOnUnponyfilled = (k9 = globalThis.window!)?.Object.keys({
  e: 5
});
let k10;
export const satisfiesOnPlainHop = (k10 = globalThis.self satisfies object)?.Object.assign({}, {
  f: 6
});

// a WRAPPER around a MULTI-HOP nav inside the chain-assign: the head the guard re-emits is the
// target and the operator, nothing between them. slicing it up to the VALUE swallowed the wrapper's
// opening token while its closer went with the replaced span, and the module stopped parsing
let k13;
export const wrappedMultiHopNav = (k13 = globalThis.window.self)?.Object.getOwnPropertyNames({});
let k14;
export const wrappedResolvableNav = (k14 = globalThis.self.window)?.Promise.reject(1).catch(() => {});
let k15;
export const doubleWrappedNav = (k15 = globalThis.window.self)?.Object.getPrototypeOf({});
let k11;
export const castAroundAssign = ((k11 = globalThis.self) as any)?.Math.sign(-2);
let k12;
export const nonNullOnResult = (k12 = globalThis.self)!.String.fromCodePoint(99);