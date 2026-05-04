// usage-global: enumerateFallbackDestructureBranches walks both consequent and
// alternate, calling buildDestructuringInitMeta per branch. shorthand `{from}`
// dispatches Array.from polyfill from the Array branch AND Iterator.from polyfill
// from the Iterator branch - both deps land at file level. distinct destructure
// receivers per declaration line make per-branch import linkage explicit:
// first declaration brings Array+Iterator from-deps, second declaration brings
// Array.from + Set polyfills (Set has no static `from` but the constructor lands)
const { from } = cond ? Array : Iterator;
from([1]);
const { from: arrFrom } = cond ? Array : Set;
arrFrom([2]);
