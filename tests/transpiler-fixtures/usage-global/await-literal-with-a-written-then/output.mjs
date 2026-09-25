import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an await hands a value on only where it is no thenable, and a `then` the FILE writes onto
// `Object.prototype` makes every literal one - an array too: each container below is resolved
// through that `then` rather than handed on, so neither flavor names the value it reads a static
// off - pure keeps the read native, usage-global injects nothing for it (the array pattern's own
// lowering still takes `es.array.from`)
Object.prototype.then = function (done) {
  delete Object.prototype.then;
  done({
    a: Set
  });
};
const record = () => ({
  a: Array
});
const list = () => [Promise];
export async function viaRecord() {
  const {
    a: A
  } = await record();
  return A.of(1);
}
export async function viaList() {
  const [P] = await list();
  return P.withResolvers();
}