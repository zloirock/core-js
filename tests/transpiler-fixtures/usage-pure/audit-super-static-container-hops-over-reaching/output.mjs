import _Promise from "@core-js/pure/actual/promise";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _WeakMap from "@core-js/pure/actual/weak-map";
let reassigned = {
  Base: _WeakMap
};
reassigned = {
  Base: _Promise
};
class OverReaching extends reassigned.Base {
  static attempted() {
    return _Promise$try.call(this, () => 4);
  }
}
export { OverReaching };