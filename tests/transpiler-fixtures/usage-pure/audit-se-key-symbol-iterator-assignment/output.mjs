import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// an SE-prefix computed `[(eff++, Symbol.iterator)]` ASSIGNMENT key: the pattern stays fully
// in place (key effect exactly once) and the target re-assigns from the iterator-method
// helper AFTER the statement, so the raw in-pattern write is dead and needs no sentinel -
// unlike the declaration route, where the extraction BINDS FIRST and the residual must
// rename its slot to a throwaway to keep the polyfill binding un-clobbered
let eff = 0;
const arr = [3];
let it;
({
  [(eff++, _Symbol$iterator)]: it
} = arr);
it = _getIteratorMethod(arr);
export const r = [it, eff];