import _Array$from from "@core-js/pure/actual/array/from";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// Extracting an inherited method still reads the class binding.
// Before the declaration that read must throw ReferenceError.
const effects = [];
export const result = (() => {
  try {
    const f = (Bag, _Array$from);
    class Bag extends Array {}
    return 0;
  } catch (error) {
    return _nameMaybeFunction(error);
  }
})();