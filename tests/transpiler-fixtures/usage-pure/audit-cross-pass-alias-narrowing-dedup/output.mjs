import _Array$from from "@core-js/pure/actual/array/from";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
// pre-pass injects `_Array$from` for the bare `Array.from` call; post-pass re-runs
// against the rewritten source where `_Array$from` already lives. snapshot/rehydrate
// of `#importInfoByName` (captureImportInfoByName) must carry `entry: array/from` across
// the pre+post boundary, otherwise post-pass receiver narrowing on the alias-stored
// result regresses to generic. each method below tests a distinct alias narrowing path
// after the cross-pass dedup:
//   - `entries` returns Iterator (different return-type hint than at/flat/findLast)
//   - `keys` similarly returns ArrayIterator - covers the iterator-typed return branch
//   - `slice` returns Array (return-type identity narrowing, distinct from the iterator pair)
const xs = _Array$from('abc');
const e = _entriesMaybeArray(xs).call(xs);
const k = _keysMaybeArray(xs).call(xs);
const s = _sliceMaybeArray(xs).call(xs, 0, 2);