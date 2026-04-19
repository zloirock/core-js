import _Promise$try from "@core-js/pure/actual/promise/try";
// default import from `/constructor` subpath — `entryToGlobalHint('promise/constructor')`
// must take the first segment and return `Promise`, not the whole entry
import MyPromise from '@core-js/pure/actual/promise/constructor';
class C extends MyPromise {
  static m() {
    return _Promise$try.call(this, () => 1);
  }
}