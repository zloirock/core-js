// pre-pass injects `_Array$from` for the bare `Array.from` call; post-pass re-runs
// against the rewritten source where `_Array$from` already lives. snapshot/rehydrate
// of `#importInfoByName` (captureImportInfoByName) must carry `entry: array/from` across
// the pre+post boundary, otherwise post-pass receiver narrowing on the alias-stored
// result regresses to generic. each method below tests a distinct alias narrowing path
// after the cross-pass dedup:
//   - `entries` returns Iterator (different return-type hint than at/flat/findLast)
//   - `keys` similarly returns ArrayIterator - covers the iterator-typed return branch
//   - `slice` returns Array (return-type identity narrowing, distinct from the iterator pair)
const xs = Array.from('abc');
const e = xs.entries();
const k = xs.keys();
const s = xs.slice(0, 2);
