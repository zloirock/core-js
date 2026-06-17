import "core-js/modules/es.symbol.async-dispose";
import "core-js/modules/es.symbol.dispose";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.error.is-error";
import "core-js/modules/es.suppressed-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.async-iterator.async-dispose";
import "core-js/modules/es.iterator.dispose";
// An `await using` declaration whose body explicitly reads a shadowed-global static. The async-dispose
// scaffolding is keyed on the declaration kind, so it lands regardless; but `Symbol` here is a local
// parameter binding, so the explicit `Symbol.for` static must NOT be polyfilled - the global Symbol
// statics stay out of the import set.
async function main(Symbol) {
  await using resource = getAsyncResource();
  Symbol.for('resource-key');
}