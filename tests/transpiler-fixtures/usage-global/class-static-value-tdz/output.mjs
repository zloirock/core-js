import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.function.name";
import "core-js/modules/es.string.iterator";
// Extracting an inherited method still reads the class binding.
// Before the declaration that read must throw ReferenceError.
const effects = [];
export const result = (() => {
  try {
    const f = Bag.from;
    class Bag extends Array {}
    return 0;
  } catch (error) {
    return error.name;
  }
})();