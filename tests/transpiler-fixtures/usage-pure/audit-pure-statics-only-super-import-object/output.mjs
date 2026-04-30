import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// statics-only owner with multiple polyfilled methods; verifies pass-2 head registration
// covers any number of subsequent super-static calls. distinct methods on the same owner
// also confirm cross-method isolation (no over-injection from one method's import)
import MyObject from '@core-js/pure/actual/object';
class Recorder extends MyObject {
  static merge(target, source) {
    return _Object$assign.call(this, target, source);
  }
  static rebuild(entries) {
    return _Object$fromEntries.call(this, entries);
  }
}