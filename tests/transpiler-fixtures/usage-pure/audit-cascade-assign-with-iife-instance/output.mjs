import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// Object-rest keeps the affected assignment pattern native and preserves its RHS value.
// Independent reads and key/default expressions still receive their own polyfills.
let from, rest;
({
  Array: {
    from
  },
  ...rest
} = (console.log(_valuesMaybeArray(_ref = []).call(_ref)), _globalThis));
export { from, rest };