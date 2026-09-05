// two more retention channels with no mutating call behind them: `Object.create` installs the
// argument as the new object's prototype, and a Proxy keeps its target alive behind the handler.
// neither writes to the object, so a "does this call mutate the argument" test reads them as
// harmless - but both hand out a live reference, so the field narrow has to stand down. distinct
// method per row, both carrying an array and a string variant
export function viaObjectCreate() {
  const proto = {
    items: [1, 2],
    read() {
      return this.items.at(0);
    }
  };
  const child = Object.create(proto);
  return [proto.read(), child];
}
export function viaProxyTarget() {
  const inner = {
    items: [1, 2],
    read() {
      return this.items.includes(1);
    }
  };
  const wrapped = new Proxy(inner, handler);
  return [inner.read(), wrapped];
}
