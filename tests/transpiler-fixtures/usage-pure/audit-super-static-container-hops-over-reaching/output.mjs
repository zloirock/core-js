import _Promise from "@core-js/pure/actual/promise";
import _WeakMap from "@core-js/pure/actual/weak-map";
let reassigned = {
  Base: _WeakMap
};
reassigned = {
  Base: _Promise
};
class OverReaching extends reassigned.Base {
  static attempted() {
    return super.try(() => 4);
  }
}
export { OverReaching };