// user already imported the same pure entry under a hint-shaped name. addPureImport must
// dedupe through existingPureImports and reuse the user's binding rather than allocate a
// fresh suffix. trackReferencedName fires on the dedupe path so the dead-import filter
// preserves the import even if the plugin never references it directly
import _Array$from from "@core-js/pure/actual/array/from";
const a = _Array$from([1, 2]);
const b = _Array$from([3, 4]);