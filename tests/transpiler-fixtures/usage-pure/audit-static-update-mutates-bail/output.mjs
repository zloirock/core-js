import _Array$of from "@core-js/pure/actual/array/of";
// UpdateExpression `Array.from++` desugars to read-then-write on the same slot; the
// write half mutates the static member. pre-pass must treat `++` / `--` as mutations
// alongside `=` and `+=` - subsequent reads of `Array.from` stay as-is so the user's
// post-increment value wins. independent `Array.of` still polyfills
Array.from++;
Array.from([1, 2, 3]);
_Array$of(4, 5, 6);