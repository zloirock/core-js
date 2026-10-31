import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
const [{
  Symbol: ArrayWrapSymbol
}] = [_globalThis];
const viaArrayWrap = _Symbol$iterator;
export const f = _getIteratorMethod([11, 12]);