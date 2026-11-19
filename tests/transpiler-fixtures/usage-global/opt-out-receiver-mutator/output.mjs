import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
// core-js-disable-next-line
Object.defineProperty(Promise, "resolve", {
  value: value => ({
    custom: value
  }),
  configurable: true
});
r = Promise.resolve(1);