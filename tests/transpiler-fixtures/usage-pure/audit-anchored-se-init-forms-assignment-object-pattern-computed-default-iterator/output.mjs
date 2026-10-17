import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// bodyless-if assignment host with a DEFAULTED symbol leaf: the key-swap rebuild keeps the
// slot bodyless (single-statement anchored shape)
let bif;
if (cond) ({
  [_Symbol$iterator]: bif = null
} = _Iterator);
export const r = [bif];