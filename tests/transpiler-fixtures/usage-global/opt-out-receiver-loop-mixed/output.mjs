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
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Keep disabled source slots native while independent live claims remain eligible.
export let r;
export const effects = [];
const nativeResolve = Function("return Promise.resolve")();
const out = [];
// core-js-disable-next-line
for (const {
  resolve
} of [Promise,
// core-js-disable-line
Promise]) {
  out.push(resolve === nativeResolve);
}
r = [out[0], out.length];