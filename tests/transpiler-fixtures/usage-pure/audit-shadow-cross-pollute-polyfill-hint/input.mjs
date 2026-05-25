// outer scope has a pure-import `MyPromise` registered with the injector under hint='Promise'.
// inner function declaration shadows it - `MyPromise` inside `inner` is the user's function,
// NOT the polyfilled Promise. `super.try` on `class C extends MyPromise` must NOT route
// through the global Promise polyfill: the adapter's `getBinding` would otherwise carry
// `polyfillHint='Promise'` on the shadowing binding, and `binding-to-global lookup` would
// dispatch the polyfill against the user's local function (silently miswiring user code)
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
