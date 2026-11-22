// a namespace declaration in the file must not disturb the hop resolution
namespace SideNs { export const unrelated = 1; }
const nsRoot = Object;
const nsLink = nsRoot;
export function viaNamespaceSibling(nsRoot) {
  const { fromEntries } = nsLink;
  return fromEntries([]);
}
