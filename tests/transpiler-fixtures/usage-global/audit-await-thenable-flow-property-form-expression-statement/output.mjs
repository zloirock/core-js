import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.at";
// A structural Flow thenable propagates the value supplied through its then callback. Property and optional-property spellings
// retain the same fulfillment type.
class ClassThenable<T> {
  then: (cb: (v: T) => any) => ClassThenable<T>;
}
async function classProbe(a: ClassThenable<Array<number>>) {
  (await a).at(-1);
}
classProbe();