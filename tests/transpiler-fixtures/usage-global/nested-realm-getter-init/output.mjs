import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.push";
import "core-js/modules/es.array.values";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/web.dom-collections.values";
// A realm getter behind a sequence prefix is evaluated once for several nested leaves.
// The quiet surface retains its normal reusable navigation.
const log = [];
const A = Array;
Object.defineProperty(globalThis, 'Array', {
  configurable: true,
  get() {
    log.push('Array');
    return A;
  }
});
const {
  prototype: {
    at,
    values
  }
} = (log.push('prefix'), globalThis.Array);
export { at, values, log };