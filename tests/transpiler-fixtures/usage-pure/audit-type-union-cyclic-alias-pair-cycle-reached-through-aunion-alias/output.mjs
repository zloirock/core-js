import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _entries from "@core-js/pure/actual/instance/entries";
type Loop = Ring | {
  kind: "a";
  entries: string[];
};
type Ring = Loop | {
  kind: "b";
  entries: string[];
};
declare const viaUnion: Ring;
// the cycle is reached THROUGH a union alias rather than directly
export function cycleReachedThroughAUnionAlias() {
  var _ref;
  if (viaUnion.kind === "a") return _includesMaybeArray(_ref = _entries(viaUnion)).call(_ref, "x");
  return false;
}