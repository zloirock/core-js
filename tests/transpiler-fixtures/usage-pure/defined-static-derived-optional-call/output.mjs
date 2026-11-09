import _Array$from from "@core-js/pure/actual/array/from";
// Replacing a defined static does not remove an optional testing its derived value.
export const read = () => _Array$from([1]).foo?.();