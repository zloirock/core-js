// User imports `MyPromise` from `@core-js/pure/actual/promise/constructor` (the
// `/constructor` subpath). Plugin recognizes the import source as the `Promise`
// constructor, so `super.try(...)` in a subclass gets the `Promise.try` polyfill.
import MyPromise from '@core-js/pure/actual/promise/constructor';
class C extends MyPromise {
  static m() { return super.try(() => 1); }
}
