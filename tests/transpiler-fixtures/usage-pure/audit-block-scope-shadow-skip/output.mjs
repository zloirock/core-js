import _Array$from from "@core-js/pure/actual/array/from";
// inner block redeclares `Array` as a local binding: the inner `Array.from(...)` is left
// alone. top-level `Array.from(...)` outside the block still resolves to its polyfill
{
  const Array = [1, 2, 3];
  Array.from([4, 5]);
}
_Array$from([1, 2]);