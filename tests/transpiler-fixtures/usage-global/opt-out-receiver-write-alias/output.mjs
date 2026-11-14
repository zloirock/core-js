import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
const P = Promise;
// core-js-disable-next-line
P.resolve = value => ({
  custom: value
});
r = Promise.resolve(1);