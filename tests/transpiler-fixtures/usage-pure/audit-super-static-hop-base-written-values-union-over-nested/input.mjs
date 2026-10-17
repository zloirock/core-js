let closureNs = { Base: Boolean };
const set = () => { closureNs = { Base: Promise }; };
const nested = { inner: closureNs };
class OverNested extends nested.inner.Base {
  static go() { return super.allSettled([]); }
}
export { OverNested };
