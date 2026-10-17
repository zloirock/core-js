import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.includes";
type AliasThenable<T> = {
  then: (cb: (v: T) => any) => AliasThenable<T>
};
async function aliasProbe(c: AliasThenable<Array<string>>) {
  (await c).includes('x');
}
aliasProbe();