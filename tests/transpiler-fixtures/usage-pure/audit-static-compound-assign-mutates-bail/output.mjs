import _Array$of from "@core-js/pure/actual/array/of";
// compound assignment `Array.from += "x"` desugars to read-modify-write on the same slot;
// the write half mutates the static member. pre-pass `collectMutatedStaticMembers` must
// treat compound operators like `+=` the same as `=` - subsequent reads of `Array.from`
// stay as-is so the user's monkey-patch wins. independent `Array.of` still polyfills
Array.from += "x";
Array.from([1, 2, 3]);
_Array$of(4, 5, 6);