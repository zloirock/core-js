import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// `iterator` destructured off the bare Symbol constructor IS Symbol.iterator, so a computed member
// read through it (`[...][iterator]`) is an iterator-method access and folds to the pure
// `_getIteratorMethod` helper - the same fold as a direct `[...][Symbol.iterator]`, recovered
// through the destructure alias by its registered Symbol module source
const iterator = _Symbol$iterator;
_getIteratorMethod([1, 2]);