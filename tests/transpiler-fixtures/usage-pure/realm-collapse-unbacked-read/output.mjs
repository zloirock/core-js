import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _self from "@core-js/pure/actual/self";
// An ordinary unbacked navigation keeps the established realm-collapse spelling.
// Unlike a mutation host, its optional tail may fold onto the backed self.
export function read(effects) {
  return (_pushMaybeArray(effects).call(effects, "prefix"), _self).slotD;
}