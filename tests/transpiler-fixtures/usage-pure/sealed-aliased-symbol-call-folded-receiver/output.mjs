import _getIterator from "@core-js/pure/actual/get-iterator";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A sealed optional lookup through a symbol-key alias keeps its folded proxy receiver.
// Its receiver call and hop effects run once before consumption, including without a memo.
const key = _Symbol$iterator;
function getRealm() {
  setup();
  return _globalThis;
}
export const result = (null == (getRealm(), hop(), _self) ? void 0 : void 0, _getIterator(_self));