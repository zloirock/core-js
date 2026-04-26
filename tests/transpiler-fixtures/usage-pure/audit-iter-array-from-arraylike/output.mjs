import _Array$from from "@core-js/pure/actual/array/from";
// `Array.from(arrayLike)`: the iteration protocol must be polyfilled along with the
// static method since `Array.from` falls through to it for non-iterable inputs.
_Array$from({
  length: 3,
  0: 'a',
  1: 'b',
  2: 'c'
});