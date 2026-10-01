// statics-only owner with multiple polyfilled methods; verifies pass-2 head registration
// covers any number of subsequent super-static calls. distinct methods on the same owner
// also confirm cross-method isolation (no over-injection from one method's import)
import MyObject from '@core-js/pure/actual/object';
class Recorder extends MyObject {
  static merge(target, source) {
    return super.assign(target, source);
  }
  static rebuild(entries) {
    return super.fromEntries(entries);
  }
}
