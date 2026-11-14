import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
const nativeResolve = Function("return Promise.resolve")();
let held;
// core-js-disable-next-line
const {
  resolve
} = held = Promise // core-js-disable-line
;
r = [resolve === nativeResolve, held === Function("return Promise")()];