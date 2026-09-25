import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
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
const [p0, {
  Map: M
} = _globalThis] = [{}, userObj];
export const viaForeignPair = (M === _Map ? _Map$groupBy : M.groupBy.bind(M))([1, 2], v => v);

// spread-shifted pair: the pair is unknown, the default may or may not fire - the static read
// takes the runtime identity guard against the lone candidate instead of a substitution
const [s0, {
  Array: A
} = _globalThis] = [...t];
export const viaSpreadPair = (A === Array ? _Array$from : A.from.bind(A))([1, 2]);

// dynamic init: no pairing evidence at all - the live slot's static read is guarded against the
// default's candidate, the default is mirrored
const [d0, {
  Promise: P
} = {
  Promise: _Promise
}] = dyn;
export const viaDynamicInit = (P === _Promise ? _Promise$allSettled : P.allSettled.bind(P))([]);

// literal object default with an unknown pair bails the same way
const [l0, {
  ns: N
} = {
  ns: _Iterator
}] = [...t];
export const viaLiteralDefault = N.range(0, 3);

// control: a provably-defined pair keeps the pair fold (the slot default is dead)
let fallback = {};
const [{
  Set: C
} = fallback] = [{
  Set: _Set
}];
export const viaSoundPair = new C(soundSeed);

// absent element with a receiver default: the hole fires the default, which is mirrored whole
const [{
  WeakSet: K
} = {
  WeakSet: _WeakSet
}] = [];
export const viaAbsentPair = new K();

// deep nesting: a dead default under a sound deep pair extracts the same way
let deepFb = {};
const [[{
  Iterator: I
} = deepFb]] = [[{
  Iterator: _Iterator
}]];
export const viaDeepDeadDefault = _Iterator.range(0, 3);

// control: the flat extraction channel serves the static outright - its pure import is never
// undefined, so the default is dead
let shim = () => [];
const of = _Array$of;
export const viaGuardedExtraction = of(1, 2);