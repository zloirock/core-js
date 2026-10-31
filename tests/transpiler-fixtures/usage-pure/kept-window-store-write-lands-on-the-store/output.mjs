import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a member WRITTEN through a stored environment probe (`(w = globalThis.window).self.k = v`) acts on
// the stored value, exactly as its read twin reads it: the realm hops above the store drop onto it
// and the write keeps the throw the source has where the value is absent. a store of the realm
// itself keeps the hop's own ponyfill as the write base, and a `delete` lands the run's root
let w,
  k = 'keyed';
(w = _globalThis.window, null == w ? null.self : w).Set = function () {};
(w = _globalThis.window, null == w ? null.self : w)[k] = 1;
(w = _globalThis.window, null == w ? null.self : w).counted++;
(w = _globalThis.window, null == w ? null.self : w).added += 1;
(w = _globalThis.window, null == w ? null.self : w).defaulted ||= 1;
[(w = _globalThis.window, null == w ? null.self : w).element] = [1];
({
  v: (w = _globalThis.window, null == w ? null.self : w).property
} = {
  v: 1
});
for ((w = _globalThis.window, null == w ? null.self : w).head of [1]);
(w = _globalThis.window, null == w ? null.self : w).deep = 1;
(w = _globalThis['window'], null == w ? null.self : w).computed = 1;
(w = _globalThis.window, null == w ? null.self : w).prefixed = 1;
let g;
(g = _globalThis, _self).realmStored = 1;
delete (w = _globalThis.window, _globalThis).deleted;
export { w, g };