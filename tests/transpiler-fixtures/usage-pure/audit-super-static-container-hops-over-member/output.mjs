import _Object$groupBy from "@core-js/pure/actual/object/group-by";
const outer = {
  inner: {
    Base: Object
  }
};
const viaMember = outer.inner;
class OverMember extends viaMember.Base {
  static keyed() {
    return _Object$groupBy.call(this, [2], x => x);
  }
}
export { OverMember };