// the flatten's sibling walk substitutes proxy-global reads in the declarators it re-emits, but a
// slot another channel replaces WHOLESALE has no room for that transform: the `key in obj` fold,
// and all three receiver slots a synth swap owns - a destructure host's init and right, and an
// IIFE argument the callee destructures in its own param pattern, in every shape that invokes it
// (plain call, optional call, `new`). a computed hop key it cannot
// fold in the DECLARATION scope is not a verdict either: the natural visitor may still claim it
const { Array: { of } } = globalThis, hasMap = 'Map' in globalThis;
const { Object: { entries } } = globalThis, fnArg = (function ({ Promise }) { return Promise; })(globalThis);
const { Object: { assign } } = globalThis, arrowArg = (({ Map }) => Map)(globalThis);
const { Promise: { allSettled } } = globalThis, secondArg = (function (a, { Set }) { return Set; })(1, globalThis);
const { Object: { keys } } = globalThis, optionalArg = (function ({ Set }) { return Set; })?.(globalThis);
const { Object: { freeze } } = globalThis, constructedArg = new (function ({ Map }) { this.m = Map; })(globalThis);
const { Number: { isInteger } } = globalThis, nested = () => { const NAME = 'Promise'; return globalThis[NAME]; };

// negatives: a plain sibling read and a static off a known constructor keep their substitution,
// and an IIFE whose parameter is not a pattern owns nothing
const { Array: { from } } = globalThis, plain = globalThis;
const { Object: { values } } = globalThis, staticOff = globalThis.Object.fromEntries([]);
const { Number: { isFinite } } = globalThis, plainArg = (function (g) { return g; })(globalThis);

export { of, hasMap, entries, fnArg, assign, arrowArg, allSettled, secondArg, isInteger, nested };
export { keys, optionalArg, freeze, constructedArg };
export { from, plain, values, staticOff, isFinite, plainArg };
