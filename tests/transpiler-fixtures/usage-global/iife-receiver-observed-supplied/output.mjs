import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// An observed supplied receiver keeps its identity; its static is extracted in the body.
export const effects = [];
export const r = (() => {
  return function ({
    from
  } = Object) {
    return [from([4])[0], arguments[0] === Array];
  }(Array);
})();