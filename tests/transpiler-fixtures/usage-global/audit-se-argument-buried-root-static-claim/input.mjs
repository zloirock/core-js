// the buried proxy-global root of an inline-provable call carries a SIDE-EFFECT-BEARING ARGUMENT.
// the effect has to be re-emitted somewhere, and whoever re-emits it must not take the hop's
// static claim with it: the `.of` below is the global's, not the argument's, so dropping the claim
// leaves a raw read off the memo (undefined on ie:11) and loses the import outright. one static and
// one instance method per line, so a row that stops resolving shows up in the import set as well.
let seCount = 0;
export const seArgStatic = (x => globalThis)(Array.from([1]))?.window?.Array.of(5).at(0);
export const seArgInstance = (x => globalThis)([1, [2]].flat())?.window?.Object.values({ b: 2 }).includes(2);
export const seArgSequence = (x => globalThis)((seCount++, 'ab'.padStart(3, '-')))?.window?.String.fromCodePoint(99, 100).endsWith('d');

// the effect sits on BOTH sides of the call - the callee body and the argument - so the order the
// two are re-emitted in is observable, and the claim still has to survive both
export const seBodyAndArg = (x => {
  seCount++;
  return globalThis;
})(Object.entries({ a: 1 }))?.window?.Reflect.ownKeys({ c: 3 }).flatMap(key => [key]);

// the same root without a live optional over the hop: the receiver is swallowed rather than kept
// in a test, so the effect travels a different path to the output
export const seArgPlainHop = (x => globalThis)(Number.parseFloat('1.5')).window.Set.prototype.has.call(new Set([1]), 1);

// BASELINE: an effectless argument - nothing to re-emit, and the claim is never at risk
export const noSeArg = (x => globalThis)(1)?.window?.Promise.resolve(4).finally(() => {});
