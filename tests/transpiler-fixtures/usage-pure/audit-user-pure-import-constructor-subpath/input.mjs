// default import from `/constructor` subpath — `entryToGlobalHint('promise/constructor')`
// must take the first segment and return `Promise`, not the whole entry
import MyPromise from '@core-js/pure/actual/promise/constructor';
class C extends MyPromise {
  static m() { return super.try(() => 1); }
}
