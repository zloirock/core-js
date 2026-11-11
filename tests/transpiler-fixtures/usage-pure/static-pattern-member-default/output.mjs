import _Array$from from "@core-js/pure/actual/array/from";
// A pattern-valued static keeps its inner default and member write.
export const box = {};
({
  length: box.length = 9
} = _Array$from);