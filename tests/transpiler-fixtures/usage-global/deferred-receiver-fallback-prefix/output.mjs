import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A retained receiver keeps its child claims and source effects through deferred rendering.
export let r;
export const effects = [];
function eff(x) {
  effects[effects.length] = x;
}
const {
  resolve
} = ((eff("p"), globalThis.window)?.self).Promise ?? {};
r = typeof resolve;