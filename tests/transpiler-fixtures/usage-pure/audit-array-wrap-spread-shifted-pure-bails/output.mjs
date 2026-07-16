import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
// a spread-shifted array-wrap slot pairs a POSSIBLE value, not a certain one (the spread's own
// items are unenumerable), so pure's receiver-dropping rewrite must not treat the lone enumerated
// candidate as the binding's value: at runtime the slot may hold any spread element, and a
// substituted pure binding would compute the wrong value. every row stays verbatim.
let tail = [{}, {}];

// static member off the maybe-alias: no substitution, the read stays on the runtime value
const [, {
  Set: S
}] = [...tail, _globalThis];
export const viaStaticRead = S.union;

// ctor construction through the maybe-alias stays verbatim too
const [, {
  Map: M
}] = [...tail, _globalThis];
export const viaCtorConstruct = new M([[1, 2]]);

// nested pattern past the spread: the recursion reports the shift, the leaf stays verbatim
const [, [{
  Promise: P
}]] = [...tail, [{
  Promise: _Promise
}]];
export const viaNestedShift = P.allSettled([]);

// CONTROL: a slot strictly BEFORE the spread pairs exactly and still resolves
const [{
  WeakSet: W
}] = [_globalThis, ...tail];
export const viaPreSpreadExact = new W();

// a union candidate in the shifted slot changes nothing for pure: the shift alone already
// poisons certainty, all-proxy arms included
const [, {
  Symbol: SY
}] = [...tail, flip ? _globalThis : _self];
export const viaShiftedUnionPure = SY.asyncIterator;