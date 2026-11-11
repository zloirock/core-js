import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// The class read can throw before the computed key runs.
export const effects = [];
export const result = (() => {
  try {
    Bag, _pushMaybeArray(effects).call(effects, "key"), _Array$from.call(Bag, []);
    class Bag extends Array {}
  } catch (error) {
    return _nameMaybeFunction(error);
  }
})();