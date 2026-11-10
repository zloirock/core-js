import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A resolved invocation supplies the receiver; its effects and unresolved reads run once.
export const effects = [];
export const r = (() => {
  function make() {
    _pushMaybeArray(effects).call(effects, "make");
    return Array;
  }
  return (({
    from,
    length
  } = Object) => [from([6])[0], length])(function (_ref) {
    return {
      from: _Array$from,
      get length() {
        return _ref.length;
      }
    };
  }(make`tag`));
})();