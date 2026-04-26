// inner block redeclares `Array`: inside the block the local binding wins and the
// `Array.from(...)` call is left alone; outer `Array.from(...)` still polyfills.
{
  const Array = [1, 2, 3];
  Array.from([4, 5]);
}
Array.from([1, 2]);
