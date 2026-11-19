import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// An observed supplied receiver keeps its identity; its static is extracted in the body.
export const effects = [];
export const r = (() => {
  return function ({} = Object) {
    let from = _Array$from;
    return [from([4])[0], arguments[0] === Array];
  }((_pushMaybeArray(effects).call(effects, "argument"), Array));
})();