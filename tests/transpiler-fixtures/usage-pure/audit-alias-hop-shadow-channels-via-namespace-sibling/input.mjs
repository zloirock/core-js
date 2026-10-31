// a namespace declaration in the file must not disturb the hop resolution
const nsRoot = Object;
const nsLink = nsRoot;
export function viaNamespaceSibling(nsRoot) {
  const { fromEntries } = nsLink;
  return fromEntries([]);
}
