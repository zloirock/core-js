import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
import _Symbol from "@core-js/pure/actual/symbol";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// a pattern leaf whose target is a MEMBER stores its value there as `target = value` does, and hands it on the same
// way. a target rooted where the realm may stand - an undeclared name, `this` - keeps the slot native, and the
// constructor leaves the file with its statics owed; a target a binding of this file roots takes the extraction and
// owes them where that binding leaves or a static is read back off the slot, a computed key read as the flat store
// reads it. a slot nothing reads back keeps the narrow entry
({
  Map: sink.y
} = _globalThis);
({
  Set: sink[key]
} = _globalThis);
export function F() {
  ({
    Iterator: this.y
  } = _globalThis);
}
const o = {};
o.s = _Symbol;
export { o };
const pk = 'Promise';
const r = {};
r.p = _Promise;
export const t = r.p.try(() => 1);
const tmp = {};
tmp.w = _WeakMap;
({
  Number: tmp.n
} = _globalThis);