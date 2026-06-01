// Static extracted from a hole-prefixed multi-element ArrayPattern element
// (`const [, { from }] = [Set, Array]`): `from` flattens to `const from = _Array$from` while the
// residual array destructure (the `_Set` slot and the renamed `_unused` key) survives. downstream
// `arr.at(0)` narrows to the Array-typed instance polyfill via the registered extraction alias
const [, { from }] = [Set, Array];
const arr = from([1, 2, 3]);
arr.at(0);
