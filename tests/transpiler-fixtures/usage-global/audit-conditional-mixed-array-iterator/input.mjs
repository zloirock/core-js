// shorthand `{ from }` destructured from a conditional `cond ? Array : Iterator` must
// resolve BOTH branches: Array.from from the Array branch AND Iterator.from from the
// Iterator branch, both deps landing at file level. distinct receivers per line make
// the per-branch linkage observable: first line brings Array + Iterator from-deps, second
// brings Array.from + Set (Set has no static `from`, so its constructor lands instead).
const { from } = cond ? Array : Iterator;
from([1]);
const { from: arrFrom } = cond ? Array : Set;
arrFrom([2]);
