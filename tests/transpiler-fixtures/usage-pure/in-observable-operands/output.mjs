import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _isIterable from "@core-js/pure/actual/is-iterable";
export function check(flag, trace) {
  const box = {
    get items() {
      _pushMaybeArray(trace).call(trace, 'read');
      return [];
    }
  };
  let realm = {
    Symbol: {
      iterator: 'custom'
    }
  };
  if (flag) realm = _globalThis;
  return [('flat' in box.items, true), (trace.touch, realm === _globalThis ? _isIterable([]) : realm.Symbol.iterator in [])];
}