// user already imported a pure Promise under a custom name and extends it -
// super.try(...) inside the subclass must still route to the Promise.try polyfill
import MyPromise from '@core-js/pure/actual/promise';
class C extends MyPromise {
  static m() { return super.try(() => 1); }
}
