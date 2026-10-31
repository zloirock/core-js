import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
// a namespace declaration in the file must not disturb the hop resolution
const nsRoot = Object;
const nsLink = nsRoot;
export function viaNamespaceSibling(nsRoot) {
  const {
    fromEntries
  } = nsLink;
  return fromEntries([]);
}