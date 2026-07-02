import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// IIFE-rooted proxy chain producing the well-known Symbol.iterator VALUE. the chain folds to the
// pure import and the IIFE setup survives (harvest), while the inner globalThis keeps its own
// _globalThis - the proxy-static Symbol rewrite must NOT overlap the outer collapse (text-queue crash)
let calls = 0;
const it = ((() => {
  calls++;
  return _globalThis;
})(), _Symbol$iterator);