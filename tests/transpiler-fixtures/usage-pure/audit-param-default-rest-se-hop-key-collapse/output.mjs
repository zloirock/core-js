import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
// Constructor defaults with rest use the full index; supplied objects keep their properties.
// Other static extractions require closed callers; key/default effects remain independent.
let eff = 0;
function f({
  from: _unused,
  ...rest
} = (eff++, _self).Array) {
  let from = _Array$from;
  return [from, rest];
}
f();

// each operand of a retained logical default takes the same per-operand dispatch
function g({
  of: _unused2,
  ...rest
} = (eff++, _self).Array || _Set) {
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
} = (eff++, _self).Array) {
  let from = _Array$from;
  let of = _Array$of;
  return [from, of, rest];
}
m();
function n({
  isArray,
  from: _unused5,
  ...rest
} = _self.Array) {
  let f2 = _Array$from;
  return [isArray, f2, rest];
}
n();

// a PURE-CTOR leaf (`.Map`) static-folds the WHOLE hop chain to the pure constructor
// binding - the harvested key SE rides as its sequence prefix - where the `.Array` rows
// above re-root and KEEP the leaf member read
function p({
  groupBy,
  ...rest
} = (eff++, _Map)) {
  return [groupBy, rest];
}
p();

// a STATIC computed hop key keeps the plain single-hop delete
function h({
  isArray,
  ...rest
} = _self.Array) {
  return [isArray, rest];
}
h();