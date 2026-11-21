import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A trusted assignment can carry the realm into a static call and a closed subclass.
let arrayBox;
[arrayBox] = [globalThis];
let objectBox;
({
  k: objectBox
} = {
  k: globalThis
});
export const r1 = arrayBox.Array.from([1]);
export const r2 = objectBox.Array.of(2);
class C extends arrayBox.Promise {
  static m() {
    return super.any([1]);
  }
}
export const inherited = C.m();