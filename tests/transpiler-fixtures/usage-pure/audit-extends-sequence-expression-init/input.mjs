// alias init wrapped in a SequenceExpression: `const A = (sideEffect(), Promise)`. at
// runtime A === Promise (last expression of comma chain). plugin peels the SE-tail when
// resolving the alias chain so `super.try(...)` inside the subclass routes through Promise.try
let logged = 0;
function sideEffect() { logged++; }
const A = (sideEffect(), Promise);
class C extends A {
  static run() { return super.try(() => 1); }
}
export { C, logged };
