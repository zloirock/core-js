import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A computed exclusion before a nested static and rest keeps the pure pattern native.
// Native getter order wins over polyfill coverage; global injection remains active.
const [{
  [_Symbol$iterator]: iterator,
  Array: {
    from
  },
  ...rest
}] = [_globalThis];
use(iterator, from, rest);