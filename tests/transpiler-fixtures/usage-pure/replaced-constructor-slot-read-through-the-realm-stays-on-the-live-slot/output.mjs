import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a whole-CTOR slot replacement read through the realm stays on the live slot - a nested hop, a parameter
// default's mirror (its untouched sibling still extracted), a const alias of the realm, an assignment or an
// effect-prefixed destructure, the sibling of a symbol-iterator extraction - and a local the hop binds
// reads as that local
_globalThis.Promise = function ShimPromise() {};
_globalThis.Set = function ShimSet() {};
const {
  self: {
    Promise
  }
} = {
  self: {
    Promise: _self.Promise
  }
};
export const p = Promise;
function read({
  Array: {
    from
  },
  Set
} = {
  Array: {
    from: _Array$from
  },
  Set: _globalThis.Set
}) {
  return [from([1]), new Set()];
}
export const out = read();
const g = _globalThis;
g.WeakSet = function ShimWeakSet() {};
const {
  WeakSet
} = g;
export const ws = new WeakSet();
let P2;
({
  Promise: P2
} = _globalThis);
export const p2 = P2;
const it = _getIteratorMethod(_globalThis);
const {
  Set: S3
} = _globalThis;
export const pair = [it, S3];
const {
  Promise: P3
} = (eff(), _globalThis);
export const p3 = P3;
export const t = Promise?.try;