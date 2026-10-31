import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
let tail = [{}, {}];
const [, {
  Iterator: S
}] = [...tail, _globalThis];
export const viaStaticRead = S === _Iterator ? _Iterator$from : S.from;
const [, {
  Map: M
}] = [...tail, _globalThis];
export const viaCtorConstruct = new M([[1, 2]]);
const [, [{
  Promise: P
}]] = [...tail, [{
  Promise: _Promise
}]];
export const viaNestedShift = (P === _Promise ? _Promise$allSettled : P.allSettled.bind(P))([]);
const [{
  WeakSet: W
}] = [_globalThis, ...tail];
export const viaPreSpreadExact = new W();
const [, {
  Symbol: SY
}] = [...tail, _globalThis];
export const viaShiftedUnionPure = SY === _Symbol ? _Symbol$asyncIterator : SY.asyncIterator;