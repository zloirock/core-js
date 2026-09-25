// a slot default is default-or-runtime: it fires only when the paired value IS undefined at
// runtime. with a foreign / spread-shifted / dynamic pair the binding may hold either value,
// so the pure value-union must not fold the lone resolvable default - the substitution would
// mask the foreign pair's native behavior. provably-decided pairings keep their folds, the
// default-aware extraction channel keeps its runtime-guarded handling, and a default the pair
// leaves live (unknown, absent) is mirrored in its own slot - it fires exactly where native fires it
let t = [{}, {}];

// defined foreign pair: the default is dead, the pair is unresolvable - no substitution; the static
// read is guarded against the default's candidate and reads the runtime value
let userObj = {};
const [p0, { Map: M } = globalThis] = [{}, userObj];
export const viaForeignPair = M.groupBy([1, 2], v => v);

// spread-shifted pair: the pair is unknown, the default may or may not fire - the static read
// takes the runtime identity guard against the lone candidate instead of a substitution
const [s0, { Array: A } = globalThis] = [...t];
export const viaSpreadPair = A.from([1, 2]);

// dynamic init: no pairing evidence at all - the live slot's static read is guarded against the
// default's candidate, the default is mirrored
const [d0, { Promise: P } = globalThis] = dyn;
export const viaDynamicInit = P.allSettled([]);

// literal object default with an unknown pair bails the same way
const [l0, { ns: N } = { ns: Iterator }] = [...t];
export const viaLiteralDefault = N.range(0, 3);

// control: a provably-defined pair keeps the pair fold (the slot default is dead)
let fallback = {};
const [{ Set: C } = fallback] = [globalThis];
export const viaSoundPair = new C(soundSeed);

// absent element with a receiver default: the hole fires the default, which is mirrored whole
const [{ WeakSet: K } = globalThis] = [];
export const viaAbsentPair = new K();

// deep nesting: a dead default under a sound deep pair extracts the same way
let deepFb = {};
const [[{ Iterator: I } = deepFb]] = [[globalThis]];
export const viaDeepDeadDefault = I.range(0, 3);

// control: the flat extraction channel serves the static outright - its pure import is never
// undefined, so the default is dead
let shim = () => [];
const { of = shim } = Array;
export const viaGuardedExtraction = of(1, 2);
