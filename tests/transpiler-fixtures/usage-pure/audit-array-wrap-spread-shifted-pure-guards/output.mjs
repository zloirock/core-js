import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// Spread-shifted slots denote possible constructors, so later statics need identity guards.
// Native construction and nested property reads retain the actual runtime element.
let tail = [{}, {}];

// static member off the maybe-alias: no substitution, the identity guard reads the runtime value
const [, {
  Iterator: S
}] = [...tail, _globalThis];
export const viaStaticRead = S === _Iterator ? _Iterator$from : S.from;

// ctor construction through the maybe-alias stays verbatim too
const [, {
  Map: M
}] = [...tail, _globalThis];
export const viaCtorConstruct = new M([[1, 2]]);

// nested pattern past the spread: the recursion reports the shift, the leaf's static read is guarded
const [, [{
  Promise: P
}]] = [...tail, [{
  Promise: _Promise
}]];
export const viaNestedShift = (P === _Promise ? _Promise$allSettled : P.allSettled.bind(P))([]);

// A slot before the spread keeps its native constructor read and the following iteration.
const [{
  WeakSet: W
}] = [_globalThis, ...tail];
export const viaPreSpreadExact = new W();

// a union candidate in the shifted slot changes nothing for pure: the shift alone already
// poisons certainty, all-proxy arms included - the guard tests the one candidate it can name
const [, {
  Symbol: SY
}] = [...tail, _globalThis];
export const viaShiftedUnionPure = SY === _Symbol ? _Symbol$asyncIterator : SY.asyncIterator;