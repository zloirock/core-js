import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// The assignment mirror owns one store and keeps the read through that value.
let of;
({
  Array: {
    of
  }
} = (({} = holder().value = _globalThis.window).self, {
  Array: {
    of: _Array$of
  }
}));
export { of };