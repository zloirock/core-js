import "core-js/modules/es.symbol.async-iterator";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the inline-call proof answers about the VALUE a call yields, so every callee whose call does not
// yield its return expression must stay unproven: an async arrow yields a Promise, a generator and
// an async generator yield iterators, a bodiless return yields undefined, a body with no return
// yields undefined too, and a `this`-returning function expression yields whatever the call site
// binds. none of them may hand the chain a receiver.
// each row takes a DIFFERENT static, so a row that starts resolving adds its own entry to the
// import set - one shared static would let the deduped injection of the control hide a regression.
export const asyncArrow = (async () => Map)().groupBy([1], v => v);
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
export const awaited = (async () => Promise)().then(p => p.resolve(1));

// CONTROL: the same shape whose call really does yield the global
export const control = (() => String)().fromCodePoint(99);