import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set";
const groupBy = _Map$groupBy;
// Other sources keep their rest exclusions and independently claimed statics. A `??` over a parenthesized
// `||` keeps both and the parens in the residual the claimed static leaves where no left decides: neither
// `globalThis.Map` (its constructor entry excluded, while `groupBy` keeps its own) nor `globalThis.WeakRef`.
const {
  groupBy: _unused,
  ...props
} = _globalThis.Map ?? (_globalThis.WeakRef || _Set);
export { groupBy, props };