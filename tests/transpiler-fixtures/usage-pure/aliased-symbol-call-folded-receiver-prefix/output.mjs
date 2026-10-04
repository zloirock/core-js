import _getIterator from "@core-js/pure/actual/get-iterator";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A symbol-key alias consumes a receiver with a prefix and computed proxy-hop effect.
// The folded receiver retains its own call and hop effects, so they must not replay outside it.
// The outer prefix can sit beside iterator consumption or inside its receiver argument.
const key = _Symbol$iterator;
function getRealm() {
  setup();
  return _globalThis;
}
export const result = _getIterator((prefix(), getRealm(), hop(), _self));