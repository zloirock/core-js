import _Map from "@core-js/pure/actual/map";
let optionalNs = {
  Base: Boolean
};
if (c) optionalNs = {
  Base: _Map
};
class OverOptional extends optionalNs?.Base {
  static go() {
    return super.groupBy([1], x => x);
  }
}
export { OverOptional };