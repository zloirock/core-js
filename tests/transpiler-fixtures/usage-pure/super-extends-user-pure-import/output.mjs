import _Promise$race from "@core-js/pure/actual/promise/race";
import _Promise from '@core-js/pure/actual/promise/constructor';
class P extends _Promise {
  static foo() {
    return _Promise$race.call(this, []);
  }
}