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
// An observed branching argument keeps its identity and native parameter reads.
export const effects = [];
export const r = (() => {
  const pick = Math.random() < 2;
  return function ({
    from
  } = Object) {
    void from;
    return arguments[0] === Array;
  }(pick && Array);
})();