import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A residual-keeping destructure over a realm-read LEFT: the statics read off a global core-js extends in
// place (`Array`, `Object` off the realm) keep their modules on every row, beside the static of a right
// a left the build does not serve keeps live (`Object.groupBy` past `globalThis.WeakRef`).
const {
  of,
  deep: {
    a
  }
} = globalThis.Array || (log(), Fallback);
const {
  fromEntries,
  deep: {
    b
  }
} = (globalThis.Object ?? X) || Y;
let from, c;
({
  from,
  deep: {
    c
  }
} = (log(), globalThis.Array) ?? Fallback);
const {
  fromAsync,
  deep: {
    d
  }
} = (flag ? globalThis.Array : globalThis.WeakRef) || Fallback;
const {
  groupBy,
  deep: {
    e
  }
} = globalThis.WeakRef || Object;
export function pick({
  hasOwn,
  deep: {
    f
  }
} = globalThis.Object || (log(), Fallback)) {
  return [hasOwn, f];
}
export { of, a, fromEntries, b, from, c, fromAsync, d, groupBy, e };