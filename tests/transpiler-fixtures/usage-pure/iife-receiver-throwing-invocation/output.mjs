import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
  function make() {
    _pushMaybeArray(effects).call(effects, "make");
    throw new RangeError();
  }
  try {
    return (({
      from
    }) => from)(new make());
  } catch (error) {
    return _nameMaybeFunction(error);
  }
})();