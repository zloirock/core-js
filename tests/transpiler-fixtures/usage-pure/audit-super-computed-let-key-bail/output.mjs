import _Promise from "@core-js/pure/actual/promise/constructor";
// `let M = 'try'; ...; M = 'from'` - visible reassignment registers as a constant
// violation on the binding. the plugin can't commit to either value at static time,
// so key resolution bails and the super call stays raw (runtime behaviour depends on
// order of the reassignment vs. the class method invocation)
let M = 'try';
M = 'from';
class C extends _Promise {
  static run() {
    return super[M](() => 1);
  }
}