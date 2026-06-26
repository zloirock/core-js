// SE-wrapped proxy-global ctor sub-receiver of a `.prototype.method` read (`(eff(), globalThis.self).Map
// .prototype.has.call(...)`): the prototype fallback swaps the ctor to the pure binding (`.Map` -> `_Map`),
// KEEPING `.prototype.method`, and re-emits the buried leading sequence SE - `(eff(), _Map).prototype.has` -
// instead of leaving a raw `globalThis` (ie:11 ReferenceError) or dropping the call effect. distinct ctors /
// methods per line; the `.window` hop collapses the same way; a bare read (no `.call`) takes the same path;
// the last line buries the sequence at the proxy ROOT (`(eff(), globalThis).self.WeakMap`), one hop deeper.
let log = [];
function eff(tag) {
  log.push(tag);
  return tag;
}
const mapHas = (eff('a'), globalThis.self).Map.prototype.has.call(new Map(), 1);
const setAdd = (eff('b'), globalThis.self).Set.prototype.add.call(new Set(), 2);
const winThen = (eff('c'), globalThis.window).Promise.prototype.then;
const deepNav = (eff('d'), globalThis).self.WeakMap.prototype.has.call(new WeakMap(), {});
export { mapHas, setAdd, winThen, deepNav, log };
