import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
// the inline-call proof answers about the VALUE a call yields, so every callee whose call does not
// yield its return expression must stay unproven: an async arrow yields a Promise, a generator and
// an async generator yield iterators, a bodiless return yields undefined, a body with no return
// yields undefined too, and a `this`-returning function expression yields whatever the call site
// binds. none of them may hand the chain a receiver.
// each row takes a DIFFERENT static, so a row that starts resolving adds its own entry to the
// import set - one shared static would let the deduped injection of the control hide a regression.
export const asyncArrow = (async () => _Map)().groupBy([1], v => v);
export const generator = function* () {
  return Array;
}().from([1]);
export const asyncGenerator = async function* () {
  return Object;
}().entries({
  a: 1
});
export const bareReturn = (() => {
  return;
})().hypot(3, 4);
export const noReturn = function () {}().parseFloat('1.5');
export const thisValue = function () {
  return this;
}().ownKeys({
  b: 2
});
export const awaited = (async () => _Promise)().then(p => p.resolve(1));

// CONTROL: the same shape whose call really does yield the global
export const control = _String$fromCodePoint(99);