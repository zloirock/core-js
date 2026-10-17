import _Promise from "@core-js/pure/actual/promise";
let closureNs = {
  Base: Boolean
};
const set = () => {
  closureNs = {
    Base: _Promise
  };
};
const nested = {
  inner: closureNs
};
class OverNested extends nested.inner.Base {
  static go() {
    return super.allSettled([]);
  }
}
export { OverNested };