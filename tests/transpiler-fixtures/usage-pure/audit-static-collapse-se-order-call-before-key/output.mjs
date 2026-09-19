import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A static-collapse receiver discards the WHOLE receiver, so its side effects re-emit as a sequence prefix.
// They must run in SOURCE-EVAL order: the chain-root CALL (the deepest object) evaluates BEFORE the shallower
// computed hop-key. A two-step harvest that appended the chain-root call LAST reversed source `(call, key)`
// to `(key, call)` on BOTH emitters (consistent but wrong vs native order). The `.self` hop keeps the
// receiver a proxy-global static chain; distinct static method per line.
const log = [];
const callBeforeKey = ((() => {
  _pushMaybeArray(log).call(log, "call");
  return _globalThis;
})(), _pushMaybeArray(log).call(log, "key"), _Array$of)(1);
const keyOnly = (_pushMaybeArray(log).call(log, "k2"), _Array$from)([2]);
export { callBeforeKey, keyOnly, log };