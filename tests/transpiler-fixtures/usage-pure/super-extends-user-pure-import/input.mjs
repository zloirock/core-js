import _Promise from '@core-js/pure/actual/promise/constructor';
class P extends Promise {
  static foo() { return super.race([]); }
}
