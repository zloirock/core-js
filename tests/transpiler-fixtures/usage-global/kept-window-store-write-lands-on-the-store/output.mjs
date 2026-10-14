import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// a member WRITTEN through a stored environment probe (`(w = globalThis.window).self.k = v`) acts on
// the stored value, exactly as its read twin reads it: the realm hops above the store drop onto it
// and the write keeps the throw the source has where the value is absent. a store of the realm
// itself keeps the hop's own ponyfill as the write base, and a `delete` lands the run's root
let w,
  k = 'keyed';
(w = globalThis.window).self.Set = function () {};
(w = globalThis.window).self[k] = 1;
(w = globalThis.window).self.counted++;
(w = globalThis.window).self.added += 1;
(w = globalThis.window).self.defaulted ||= 1;
[(w = globalThis.window).self.element] = [1];
({
  v: (w = globalThis.window).self.property
} = {
  v: 1
});
for ((w = globalThis.window).self.head of [1]);
(w = globalThis.window).self.self.deep = 1;
(w = globalThis['window']).self.computed = 1;
(0, w = globalThis.window).self.prefixed = 1;
let g;
(g = globalThis).self.realmStored = 1;
delete (w = globalThis.window).self.deleted;
export { w, g };