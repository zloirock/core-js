import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.includes";
import "core-js/modules/web.dom-collections.entries";
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
  if (viaUnion.kind === "a") return viaUnion.entries.includes("x");
  return false;
}