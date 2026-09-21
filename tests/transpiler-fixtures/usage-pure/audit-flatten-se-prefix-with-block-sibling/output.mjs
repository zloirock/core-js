import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// An initializer effect runs before its static binding and before the following function.
// The function keeps its own instance polyfill and local temporary.
declare function logCall(): void;
const {
    Array: {
      from
    }
  } = (logCall(), {
    Array: {
      from: _Array$from
    }
  }),
  kls = (() => {
    var _ref;
    return _valuesMaybeArray(_ref = []).call(_ref);
  })();
export { from, kls };