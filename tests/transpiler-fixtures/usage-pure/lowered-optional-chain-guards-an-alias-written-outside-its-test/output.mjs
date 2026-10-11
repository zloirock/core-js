import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _WeakSet from "@core-js/pure/actual/weak-set";
// `?.`-lowered input whose alias is written OUTSIDE the guard's test: a write the next one overwrites
// before the read is no value of it, so the read stays raw on the later value; a conditional write - a
// plain one, or the test fragment of a lowering under a branch - may leave the alias unset, so the read
// takes a realm-identity guard on the alias, over the realm hop or over the static it reads past it
var _d;
_d = _globalThis;
_d = {};
export const doubleWrite = _d.self;
var _c;
if (Math.random()) _c = _globalThis;
export const conditionalWrite = _nameMaybeFunction((_c === _globalThis ? _self : _c.self).Array);
export function branchWrite(c) {
  var _b;
  if (c) (_b = _globalThis) == null;
  return _nameMaybeFunction(_b === _globalThis ? _WeakSet : _b.self.WeakSet);
}