import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// SE-wrapped proxy-global ctor sub-receiver of a `.prototype.method` read (`(eff(), globalThis.self).Map
// .prototype.has.call(...)`): the prototype fallback swaps the ctor to the pure binding (`.Map` -> `_Map`),
// KEEPING `.prototype.method`, and re-emits the buried leading sequence SE - `(eff(), _Map).prototype.has` -
// instead of leaving a raw `globalThis` (ie:11 ReferenceError) or dropping the call effect. distinct ctors /
// methods per line; the `.window` hop collapses the same way; a bare read (no `.call`) takes the same path;
// the last line buries the sequence at the proxy ROOT (`(eff(), globalThis).self.WeakMap`), one hop deeper.
let log = [];
function eff(tag) {
  _pushMaybeArray(log).call(log, tag);
  return tag;
}
const mapHas = (eff('a'), _Map).prototype.has.call(new _Map(), 1);
const setAdd = (eff('b'), _Set).prototype.add.call(new _Set(), 2);
const winThen = (eff('c'), _Promise).prototype.then;
const deepNav = (eff('d'), _WeakMap).prototype.has.call(new _WeakMap(), {});
export { mapHas, setAdd, winThen, deepNav, log };