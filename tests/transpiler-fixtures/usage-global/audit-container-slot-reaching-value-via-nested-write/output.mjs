import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a written value reached through a NESTED container descends the remaining path too
const inner = {
  g: Object
};
const host = {
  k: inner
};
inner.g = Promise;
const {
  k: {
    g: {
      allSettled: viaNestedWrite
    }
  }
} = host;
export { viaNestedWrite };