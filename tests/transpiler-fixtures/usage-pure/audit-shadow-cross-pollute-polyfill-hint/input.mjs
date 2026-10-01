// outer scope imports `MyPromise` registered with the injector under the Promise hint.
// an inner function declaration shadows it, so `MyPromise` inside `inner` is the user's
// function, NOT the polyfilled Promise. `super.try` on `class C extends MyPromise` must
// NOT route through the global Promise polyfill - the shadowing binding must not inherit
// the Promise hint, else the polyfill dispatches against the user's local fn.
import MyPromise from '@core-js/pure/actual/promise';
function inner() {
  function MyPromise() { return { try() { return 'shadow'; } }; }
  class C extends MyPromise {
    static run() { return super.try(() => 1); }
  }
  return new C();
}
inner();
console.log(MyPromise);
