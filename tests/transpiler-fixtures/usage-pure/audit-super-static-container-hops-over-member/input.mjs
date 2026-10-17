const outer = { inner: { Base: Object } };
const viaMember = outer.inner;
class OverMember extends viaMember.Base {
  static keyed() { return super.groupBy([2], x => x); }
}
export { OverMember };
