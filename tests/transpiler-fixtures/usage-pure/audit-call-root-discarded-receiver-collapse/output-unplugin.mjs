import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a DISCARDED call/IIFE-rooted proxy receiver with a pure-ctor leaf whole-swaps the leaf and
// re-emits every side effect the dropped navigation carried - the SE-bearing chain-root call,
// a computed hop-key effect, and an effect buried in the LEAF's own computed key - in source
// order ahead of it. the decision is the shared discarded-receiver plan; a pure chain-root
// call is dropped entirely. the leaf key resolves through the canonical fold, so an
// SE-sequence leaf key still swaps instead of stranding the raw proxy hop; a folded leaf
// WITHOUT a pure ctor entry falls back to the root-collapse residual, keeping the key read
let c = 0;
function sf() {
  c++;
  return _globalThis;
}
;(sf(), c++, _Map);
const groupBy = _Map$groupBy;
export const r = [typeof groupBy, c];
const f = () => _globalThis;
_Symbol;
const iterator = _Symbol$iterator;
export const q = typeof iterator;
let n = 0;
function pf() {
  n++;
  return _globalThis;
}
;(pf(), _Promise);
const resolve = _Promise$resolve;
export const p = [typeof resolve, n];
let k = 0;
function af() {
  k++;
  return _globalThis;
}
(af(), _self)[(k++, 'Array')];
const from = _Array$from;
export const a = [typeof from, k];
let z = 0;
function nf() {
  z++;
  return _globalThis;
}
;(nf(), z++, _Symbol);
const asyncIterator = _Symbol$asyncIterator;
export const i = [typeof asyncIterator, z];