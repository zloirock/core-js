import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.apply";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A receiver invoker is a call of the function it invokes, so the parameter pairs with the
// argument the pairing places there and a static read off it injects that static alone.
// Each spelling reads a different static, and no spelling widens its constructor to the family.
function viaCall(a) {
  return a.of(1);
}
function viaApply(o) {
  return o.groupBy([1], x => x);
}
function viaReflect(m) {
  return m.groupBy([1], x => x);
}
function viaBind(p) {
  return p.withResolvers();
}
export const call = viaCall.call(null, Array);
export const apply = viaApply.apply(null, [Object]);
export const reflect = Reflect.apply(viaReflect, null, [Map]);
export const bound = viaBind.bind(null, Promise)();