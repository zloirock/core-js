import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// An argument call through a symbol-key alias retains the selected receiver as this.
// The folded receiver owns its call and hop effects after the outer prefix runs.
// The outer prefix can sit beside iterator consumption or inside its receiver argument.
const key = _Symbol$iterator;
function getRealm() {
  setup();
  return _globalThis;
}
export const result = _getIteratorMethod((prefix(), getRealm(), hop(), _self)).call(_self, 42);