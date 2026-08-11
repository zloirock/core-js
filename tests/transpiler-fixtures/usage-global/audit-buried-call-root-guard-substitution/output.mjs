import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.global-this";
import "core-js/modules/es.number.max-safe-integer";
import "core-js/modules/es.number.to-fixed";
import "core-js/modules/es.string.iterator";
// the global twin of the buried-call-root guard: here the polyfill lands on the built-ins themselves,
// so every root spelling keeps its source text and the whole decision is which modules get imported.
// that makes the method per line the discriminator - one static and one instance method each, so a row
// that stops injecting shows up as a missing module rather than hiding behind a neighbour's.
export const iifeRoot = (() => globalThis)()?.window?.Array.of(5).at(0);
export const identityArgRoot = (x => x)(globalThis)?.window?.Array.from([1, 2]).flat();
export const functionExprRoot = function () {
  return globalThis;
}()?.window?.Number.MAX_SAFE_INTEGER.toFixed(2);
let bodyCount = 0;
export const effectfulBodyRoot = (() => {
  bodyCount++;
  return globalThis;
})()?.window?.Object.entries({
  a: 1
}).findLastIndex(pair => pair[0] === 'a');
let keyCount = 0;
export const computedKeyRoot = (() => globalThis)()?.window?.Object[keyCount++, 'values']({
  b: 2
}).includes(2);
const above = () => globalThis;
export const declaredCallee = above()?.window?.Reflect.ownKeys({
  c: 3
}).flatMap(key => [key]);
export const shadowedRoot = (globalThis => globalThis)(null)?.window?.Promise.resolve(4).finally(() => {});