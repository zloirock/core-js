import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
  const user = {
    get from() {
      _pushMaybeArray(effects).call(effects, "get");
      return () => 11;
    }
  };
  return function ({
    from
  } = {
    from: _Array$from
  }) {
    return [from(), arguments[0] === user];
  }(user);
})();