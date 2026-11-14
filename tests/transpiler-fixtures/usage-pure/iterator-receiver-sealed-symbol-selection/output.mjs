import _globalThis from "@core-js/pure/actual/global-this";
import _isIterable from "@core-js/pure/actual/is-iterable";
import _self from "@core-js/pure/actual/self";
import _Symbol from "@core-js/pure/actual/symbol";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  return (choice ? _Symbol : ((null == _globalThis.window ? void 0 : _self).Symbol, _Symbol)).iterator, _isIterable([3]);
}