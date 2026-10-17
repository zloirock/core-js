import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// a namespace declaration in the file must not disturb the hop resolution
const nsRoot = Object;
const nsLink = nsRoot;
export function viaNamespaceSibling(nsRoot) {
  const fromEntries = _Object$fromEntries;
  return fromEntries([]);
}