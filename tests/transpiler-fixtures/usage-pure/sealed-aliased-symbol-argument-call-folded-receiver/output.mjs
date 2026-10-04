import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// An argument call after a sealed optional symbol lookup keeps the folded proxy as this.
// Its receiver call and hop effects must not replay in the key's guarded evaluation.
const key = _Symbol$iterator;
function getRealm() {
  setup();
  return _globalThis;
}
export const result = (null == (getRealm(), hop(), _self) ? void 0 : _getIteratorMethod(_self)).call(_self, 42);