// `?.`-lowered input whose alias is written OUTSIDE the guard's test: a write the next one overwrites
// before the read is no value of it, so the read stays raw on the later value; a conditional write - a
// plain one, or the test fragment of a lowering under a branch - may leave the alias unset, so the read
// takes a realm-identity guard on the alias, over the realm hop or over the static it reads past it
var _d;
_d = globalThis;
_d = {};
export const doubleWrite = _d.self;
var _c;
if (Math.random()) _c = globalThis;
export const conditionalWrite = _c.self.Array.name;
export function branchWrite(c) {
  var _b;
  if (c) (_b = globalThis) == null;
  return _b.self.WeakSet.name;
}
