// an inline-call chain root BURIES the proxy-global (an IIFE body, an identity argument), and the
// only hop is one core-js does not ponyfill, so nothing collapses and the guard test keeps the root
// text. the buried global carries no rewrite of its own there - the claim replaces the span it sits
// in - so the guard RENDER has to substitute it, else the memo freezes a bare `globalThis` (ie:11
// ReferenceError) with no import at all. a callee declared ABOVE the chain is the boundary: its
// global lies outside the rendered span and polyfills through its own declaration. one static and
// one instance method per line, so a row that stops resolving is visible in the import set too.
export const iifeRoot = (() => globalThis)()?.window?.Array.of(5).at(0);
export const identityArgRoot = (x => x)(globalThis)?.window?.Array.from([1, 2]).flat();
export const functionExprRoot = (function () { return globalThis; })()?.window?.Number.MAX_SAFE_INTEGER.toFixed(2);
export const selfRoot = (() => self)()?.window?.String.fromCodePoint(97, 98).padStart(4, '-');

// the root stays buried under an effect-bearing body and under a computed key carrying its own
// effect - both keep it inside the kept test, so the substitution has to reach it there too
let bodyCount = 0;
export const effectfulBodyRoot = (() => {
  bodyCount++;
  return globalThis;
})()?.window?.Object.entries({ a: 1 }).findLastIndex(pair => pair[0] === 'a');
let keyCount = 0;
export const computedKeyRoot = (() => globalThis)()?.window?.Object[(keyCount++, 'values')]({ b: 2 }).includes(2);

// BOUNDARY: the callee is declared above the chain, so its global sits outside the guard's span
const above = () => globalThis;
export const declaredCallee = above()?.window?.Reflect.ownKeys({ c: 3 }).flatMap(key => [key]);

// NEGATIVE: a parameter shadows the name - neither the inline proof nor the substitution fires
export const shadowedRoot = (globalThis => globalThis)(null)?.window?.Promise.resolve(4).finally(() => {});

// a callee that IGNORES its parameter yields the same value for every argument, so the root proves
// like the no-param spelling; a callee that READS its parameter proves only what the ARGUMENT is
const ignores = x => globalThis;
export const paramIgnoringRoot = ignores(1)?.window?.Set.prototype.has.call(new Set([1]), 1);
const reads = x => x;
export const paramReadingRoot = reads({ window: { Set: { prototype: null } } })?.window?.Set.prototype;

// NEGATIVE: a call root yielding an object of the user's own keeps the chain off the memo - the key
// spelled here is theirs, not the global's, and swapping it in would change which function runs
const plain = () => ({ window: { Math: { trunc: x => [x, 'custom'] } } });
export const nonProxyRoot = plain()?.window?.Math.trunc(6.7).at(0);

// NEGATIVE: no live optional over the hop - the emit SWALLOWS the receiver instead of keeping it
// in a test, and the buried global goes with it
export const swallowedReceiver = (() => globalThis)().Map.groupBy([1], x => x);
