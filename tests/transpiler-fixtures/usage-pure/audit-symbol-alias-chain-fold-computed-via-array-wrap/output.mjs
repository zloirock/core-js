import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A native array-wrapped Symbol alias identifies a later defaulted iterator read.
// The iterator token is served and the subsequent computed access uses the iterator helper.
const [{
  Symbol: ArrayWrapSymbol
}] = [_globalThis];
const viaArrayWrap = _Symbol$iterator;
export const f = _getIteratorMethod([11, 12]);