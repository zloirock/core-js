import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
// usage-pure resolves an inherited super-static only when the super-class alias is unconditionally
// the global at the capture point. a conditional-var base (init may be dead) or an assignment-form
// alias written AFTER the class captures it would, if resolved, replace `super.<m>` with a pure
// import - un-throwing the native undefined-base access the original must perform. the super-class
// resolver applies the canonical dominance / hint-soundness gates
class Sound extends _Promise {
  static run() {
    return _Promise$race.call(this, []);
  }
}
if (cond) {
  var Conditional = _Promise;
}
class FromConditional extends Conditional {
  static run() {
    return super.allSettled([]);
  }
}
let Written;
class FromWriteAfter extends Written {
  static run() {
    return super.any([]);
  }
}
Written = _Promise;
export { Sound, FromConditional, FromWriteAfter };