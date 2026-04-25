import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// alias init wrapped in a SequenceExpression: `const A = (sideEffect(), Promise)`. at
// runtime A === Promise (last expression of comma chain). plugin peels the SE-tail when
// resolving the alias chain so `super.try(...)` inside the subclass routes through Promise.try
let logged = 0;
function sideEffect() {
  logged++;
}
const A = (sideEffect(), _Promise);
class C extends A {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}
export { C, logged };