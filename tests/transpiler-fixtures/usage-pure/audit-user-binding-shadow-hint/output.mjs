import _Array$from2 from "@core-js/pure/actual/array/from";
// user takes the canonical `_Array$from` slot. injector's `uniqueName('_Array$from')` walks
// past the collision to `_Array$from2` via the skip-1 convention in `findUniqueName`
const _Array$from = 'already taken';
_Array$from2(x);
console.log(_Array$from);