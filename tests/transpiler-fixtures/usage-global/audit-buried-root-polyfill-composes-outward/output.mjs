import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.global-this";
import "core-js/modules/es.number.max-safe-integer";
import "core-js/modules/es.number.to-fixed";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the global twin: the source keeps its text, so the decision is which modules the BURIED calls and
// the chain tail pull in - a row whose buried call stops resolving loses its own module here

// the inner instead aborted the build on a shape that composes. one method per row keeps it readable.
export const inBody = (() => (Array.from([1]), globalThis))()?.window?.Array.of(5).at(0);
export const inArgument = (x => globalThis)(Object.entries({
  a: 1
}))?.window?.Set.prototype.has.call(new Set([1]), 1);
export const inEffectfulBody = (() => {
  Object.values({
    b: 2
  }).includes(2);
  return globalThis;
})()?.window?.Number.MAX_SAFE_INTEGER.toFixed(2);

// NEGATIVE: nothing polyfillable inside the root - the claim owns the whole span with no inner left
export const emptyRoot = (() => globalThis)()?.window?.Reflect.ownKeys({
  c: 3
}).flatMap(key => [key]);