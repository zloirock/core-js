import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// coercing an argument runs the holder's own `valueOf` with the holder itself as `this`, which hands
// no method out, so a known static that only coerces keeps the this-field narrow; a callee outside the
// static registry (`String`) is unknown and takes it away
export function viaKnownStatic() {
  const holder = {
    items: [1, 2],
    read() {
      var _ref;
      return _atMaybeArray(_ref = this.items).call(_ref, 0);
    }
  };
  Math.max(holder);
  return holder.read();
}
export function viaUnknownCallee() {
  const holder = {
    items: [1, 2],
    read() {
      var _ref2;
      return _includes(_ref2 = this.items).call(_ref2, 1);
    }
  };
  String(holder);
  return holder.read();
}