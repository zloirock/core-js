import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// a slot default is default-or-runtime: it fires only when the paired value IS undefined at
// runtime. with a foreign / spread-shifted / dynamic pair the binding may hold either value,
// so the pure value-union must not fold the lone resolvable default - the substitution would
// mask the foreign pair's native behavior. provably-decided pairings keep their folds, and the
// default-aware extraction channel keeps its runtime-guarded handling
let t = [{}, {}];

// defined foreign pair: the default is dead, the pair is unresolvable - stays native
let userObj = {};
const [p0, {
  Map: M
} = _globalThis] = [{}, userObj];
export const viaForeignPair = M.groupBy([1, 2], v => v);

// spread-shifted pair: the pair is unknown, the default may or may not fire - stays native
const [s0, {
  Array: A
} = _globalThis] = [...t];
export const viaSpreadPair = A.from([1, 2]);

// dynamic init: no pairing evidence at all - stays native
const [d0, {
  Promise: P
} = _globalThis] = dyn;
export const viaDynamicInit = P.allSettled([]);

// literal object default with an unknown pair bails the same way
const [l0, {
  ns: N
} = {
  ns: _Iterator
}] = [...t];
export const viaLiteralDefault = N.range(0, 3);

// control: a provably-defined pair keeps the pair fold (the slot default is dead)
let fallback = {};
const C = _Set;
export const viaSoundPair = new C(soundSeed);

// absent element with a receiver default stays native (a provably-absent pair is not
// classified - conservative bail, consistent in both emitters)
const [{
  WeakSet: K
} = _globalThis] = [];
export const viaAbsentPair = new K();

// deep nesting: a dead default under a sound deep pair extracts the same way
let deepFb = {};
const I = _Iterator;
export const viaDeepDeadDefault = _Iterator.range(0, 3);

// control: the flat extraction channel keeps its runtime-guarded default handling
let shim = () => [];
const of = _Array$of === void 0 ? shim : _Array$of;
export const viaGuardedExtraction = of(1, 2);