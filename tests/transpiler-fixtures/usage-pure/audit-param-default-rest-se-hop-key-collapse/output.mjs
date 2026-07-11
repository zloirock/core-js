import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
// a REST element forces the param-default fallback (no whole synth-swap), and a side-effecting
// computed proxy-hop KEY cannot be single-hop-deleted (that would drop the effect): the shared
// root-collapse harvests the key SE as a sequence prefix and re-roots, so the default reads
// `(eff++, _globalThis).Array` instead of keeping the raw hop (undefined `.self` off-browser)
let eff = 0;
function f({
  from: _unused,
  ...rest
} = (eff++, _globalThis).Array) {
  let from = _Array$from;
  return [from, rest];
}
f();

// each operand of a retained logical default takes the same per-operand dispatch
function g({
  of: _unused2,
  ...rest
} = (eff++, _globalThis).Array || _Set) {
  let of = _Array$of;
  return [of, rest];
}
g();

// MULTIPLE polyfilled props re-enter the collapse with the SAME receiver (the fallback runs
// per prop) - the once-guard keeps the second entry from queueing an equal-range twin
function m({
  from: _unused3,
  of: _unused4,
  ...rest
} = (eff++, _globalThis).Array) {
  let from = _Array$from;
  let of = _Array$of;
  return [from, of, rest];
}
m();
function n({
  isArray,
  from: _unused5,
  ...rest
} = _globalThis.Array) {
  let f2 = _Array$from;
  return [isArray, f2, rest];
}
n();

// a PURE-CTOR leaf (`.Map`) static-folds the WHOLE hop chain to the pure constructor
// binding - the harvested key SE rides as its sequence prefix - where the `.Array` rows
// above re-root and KEEP the leaf member read
function p({
  groupBy: _unused6,
  ...rest
} = (eff++, _Map)) {
  let groupBy = _Map$groupBy;
  return [groupBy, rest];
}
p();

// a STATIC computed hop key keeps the plain single-hop delete
function h({
  isArray,
  ...rest
} = _globalThis.Array) {
  return [isArray, rest];
}
h();