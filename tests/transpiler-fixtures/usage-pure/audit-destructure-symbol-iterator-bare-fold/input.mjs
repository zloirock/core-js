// `iterator` destructured off the bare Symbol constructor IS Symbol.iterator, so a computed member
// read through it (`[...][iterator]`) is an iterator-method access and folds to the pure
// `_getIteratorMethod` helper - the same fold as a direct `[...][Symbol.iterator]`, recovered
// through the destructure alias by its registered Symbol module source
const { iterator } = Symbol;
[1, 2][iterator];
