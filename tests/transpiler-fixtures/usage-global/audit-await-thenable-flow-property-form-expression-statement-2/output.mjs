import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.string.includes";
interface IfaceThenable<T> {
  then(cb: (v: T) => any): IfaceThenable<T>
}
async function ifaceProbe(b: IfaceThenable<string>) {
  (await b).includes('x');
}
ifaceProbe();