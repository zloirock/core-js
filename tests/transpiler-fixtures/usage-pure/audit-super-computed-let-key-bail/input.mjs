// `let M = 'try'; ...; M = 'from'` - visible reassignment registers as a constant
// violation on the binding. the plugin can't commit to either value at static time,
// so key resolution bails and the super call stays raw (runtime behaviour depends on
// order of the reassignment vs. the class method invocation). the raw read may be `try`,
// a static of the base, so Promise takes its whole entry
let M = 'try';
M = 'from';
class C extends Promise {
  static run() { return super[M](() => 1); }
}
