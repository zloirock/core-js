import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A destructure-bound binding's own pattern slot is NOT a reference: when a destructured holder stores
// an anonymous object array into a member and is read only locally, the binding stays module-local and
// the per-element narrow holds (`this.data.at` -> `_atMaybeArray`). It still escapes when the holder is
// exported, since importers reach the stored object (`this.data.includes` -> generic `_includes`).
const src: any = {};
const {
  localHolder
} = src;
localHolder.g = [{
  data: ["a"],
  read() {
    var _ref;
    return _atMaybeArray(_ref = this.data).call(_ref, 0);
  }
}];
(localHolder as any).g[0].read();
const {
  exportedHolder
} = src;
exportedHolder.h = [{
  data: ["b"],
  scan() {
    var _ref2;
    return _includes(_ref2 = this.data).call(_ref2, "z");
  }
}];
export { exportedHolder };