import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.function.name";
import "core-js/modules/es.string.iterator";
// The class read can throw before the computed key runs.
export const effects = [];
export const result = (() => {
  try {
    Bag[effects.push("key"), "from"]([]);
    class Bag extends Array {}
  } catch (error) {
    return error.name;
  }
})();