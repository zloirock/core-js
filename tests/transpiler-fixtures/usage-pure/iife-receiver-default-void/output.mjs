import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
  return function ({
    from
  } = (_pushMaybeArray(effects).call(effects, "default"), {
    from: _Array$from
  })) {
    return [from([5])[0], arguments[0] === undefined];
  }(void _pushMaybeArray(effects).call(effects, "argument"));
})();