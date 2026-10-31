import _Array$from from "@core-js/pure/actual/array/from";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// a static read respells to its pure import: standing alone as a statement it performs nothing and leaves, while
// a value keeps it

export const statics = [_Array$from, _Object$entries, _Promise$resolve];