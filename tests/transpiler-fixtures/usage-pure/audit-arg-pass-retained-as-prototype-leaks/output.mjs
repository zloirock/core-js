import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Object$create from "@core-js/pure/actual/object/create";
// two more retention channels with no mutating call behind them: `Object.create` installs the
// argument as the new object's prototype, and a Proxy keeps its target alive behind the handler.
// neither writes to the object, so a "does this call mutate the argument" test reads them as
// harmless - but both hand out a live reference, so the field narrow has to stand down. distinct
// method per row, both carrying an array and a string variant
export function viaObjectCreate() {
  const proto = {
    items: [1, 2],
    read() {
      var _ref;
      return _at(_ref = this.items).call(_ref, 0);
    }
  };
  const child = _Object$create(proto);
  return [proto.read(), child];
}
export function viaProxyTarget() {
  const inner = {
    items: [1, 2],
    read() {
      var _ref2;
      return _includes(_ref2 = this.items).call(_ref2, 1);
    }
  };
  const wrapped = new Proxy(inner, handler);
  return [inner.read(), wrapped];
}