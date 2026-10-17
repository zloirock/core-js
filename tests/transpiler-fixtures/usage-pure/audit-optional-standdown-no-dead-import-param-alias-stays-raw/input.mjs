// the REVERSE stands down: an alias of the PARAM (an arbitrary caller value) is not the
// global, so the raw chain keeps its own guards - and still NO dead pure import may strand
const g = globalThis;
export function paramAliasStaysRaw(g) {
  const p = g;
  return p.window?.self?.WeakSet;
}
