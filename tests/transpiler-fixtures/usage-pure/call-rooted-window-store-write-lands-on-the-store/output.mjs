import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a store holding a `window` read off a call that yields the realm is the environment probe exactly
// as a named root's store is: a write through it acts on the stored value, so off-window it throws
// where the source throws instead of landing on the realm. a prefix the source wraps the store with
// runs ahead of it once, and a read or a `delete` keeps its own rule
let w;
const key = 'keyedSlot';
const owner = {
  realm() {
    return _globalThis;
  }
};
(w = (() => _globalThis)().window, null == w ? null.self : w).assignedSlot = 1;
(w = (() => _globalThis)().window, null == w ? null.self : w)[key] = 1;
(w = (() => _globalThis)().window, null == w ? null.self : w).updatedSlot++;
(w = (() => _globalThis)().window, null == w ? null.self : w).defaultedSlot ||= 1;
[(w = (() => _globalThis)().window, null == w ? null.self : w).elementSlot] = [1];
({
  v: (w = (() => _globalThis)().window, null == w ? null.self : w).propertySlot
} = {
  v: 1
});
for ((w = (() => _globalThis)().window, null == w ? null.self : w).headSlot in {
  a: 1
});
(w = (() => _globalThis)().window, null == w ? null.self : w).deepSlot = 1;
(w = (() => _globalThis)().window, null == w ? null.self : w).window.windowSlot = 1;
(w = function () {
  return _globalThis;
}().window, null == w ? null.self : w).functionSlot = 1;
(w = owner.realm().window, null == w ? null.self : w).memberSlot = 1;
(effect(), w = _globalThis.window, null == w ? null.self : w).prefixedSlot = 1;
export const readSlot = (w = (() => _globalThis)().window, _self).readSlot;
export const deletedSlot = delete (w = (() => _globalThis)().window, _self).deletedSlot;