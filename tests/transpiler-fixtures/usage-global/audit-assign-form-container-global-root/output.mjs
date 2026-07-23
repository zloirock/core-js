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
// the container-carries-the-global shape reaches a binding through an ASSIGNMENT-form write too, not
// only a declarator: `let W; ([W] = [globalThis])` binds W to the array slot value, and the trusted
// sole write is that binding's value source. it resolves on every consumer the declarator form does -
// a static member call and an extends clause - and the negatives (a non-global container, a defaulted
// slot) stay unresolved. distinct method per line.
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
export class C extends arrayBox.Promise {
  static m() {
    return super.any([]);
  }
}