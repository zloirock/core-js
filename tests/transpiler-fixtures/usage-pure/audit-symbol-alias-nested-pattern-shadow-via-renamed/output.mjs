import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// the renamed top-level form still folds; an assignment-form top-level folds too
const renamed = _Symbol$iterator;
export const viaRenamed = _getIteratorMethod([5, 6]);