import _Array$from from "@core-js/pure/actual/array/from";
// `(0, Array).from(src)` - a comma-sequence-wrapped receiver must still be recognized
// as `Array`, so the static call polyfills to Array.from
_Array$from(src);