// user takes the canonical `_Array$from` slot. injector's `uniqueName('_Array$from')` walks
// past the collision to `_Array$from2` via the skip-1 convention in `findUniqueName`
const _Array$from = 'already taken';
Array.from(x);
console.log(_Array$from);
