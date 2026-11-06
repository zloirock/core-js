import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a `let` inside a `declare module` block is scoped to that module body, so the bare outside
// `Promise.allSettled(...)` is the real global. the over-hoist guard drops the over-hoisted
// module-scoped binding for the outside use so the Promise static polyfill is injected
declare module "m" {
  export let Promise: number;
}
Promise.allSettled([]);