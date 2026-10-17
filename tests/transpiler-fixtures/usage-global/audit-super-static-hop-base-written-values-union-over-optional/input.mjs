let optionalNs = { Base: Boolean };
if (c) optionalNs = { Base: Map };
class OverOptional extends optionalNs?.Base {
  static go() { return super.groupBy([1], x => x); }
}
export { OverOptional };
