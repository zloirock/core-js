// a slot default is default-or-runtime: it fires only when the paired value IS undefined at
// runtime. with a foreign / spread-shifted / dynamic pair the binding may hold either value,
// so the pure value-union must not fold the lone resolvable default - the substitution would
// mask the foreign pair's native behavior. provably-decided pairings keep their folds, and the
// default-aware extraction channel keeps its runtime-guarded handling
let t = [{}, {}];

// defined foreign pair: the default is dead, the pair is unresolvable - stays native
let userObj = {};
const [p0, { Map: M } = globalThis] = [{}, userObj];
export const viaForeignPair = M.groupBy([1, 2], v => v);

// spread-shifted pair: the pair is unknown, the default may or may not fire - stays native
const [s0, { Array: A } = globalThis] = [...t];
export const viaSpreadPair = A.from([1, 2]);

// dynamic init: no pairing evidence at all - stays native
const [d0, { Promise: P } = globalThis] = dyn;
export const viaDynamicInit = P.allSettled([]);

// literal object default with an unknown pair bails the same way
const [l0, { ns: N } = { ns: Iterator }] = [...t];
export const viaLiteralDefault = N.range(0, 3);

// control: a provably-defined pair keeps the pair fold (the slot default is dead)
let fallback = {};
const [{ Set: C } = fallback] = [globalThis];
export const viaSoundPair = new C(soundSeed);

// absent element with a receiver default stays native (a provably-absent pair is not
// classified - conservative bail, consistent in both emitters)
const [{ WeakSet: K } = globalThis] = [];
export const viaAbsentPair = new K();

// deep nesting: a dead default under a sound deep pair extracts the same way
let deepFb = {};
const [[{ Iterator: I } = deepFb]] = [[globalThis]];
export const viaDeepDeadDefault = I.range(0, 3);

// control: the flat extraction channel keeps its runtime-guarded default handling
let shim = () => [];
const { of = shim } = Array;
export const viaGuardedExtraction = of(1, 2);
