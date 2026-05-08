import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
// Inline-call resolution only fires for bodies whose top level is exactly one ReturnStatement.
// if/else, try/catch, for, switch all hide the return one level deeper, so the receiver call must stay intact.
// A prefix-then-return shape lifts cleanly because the prefix sits at top level alongside the single return.
const ifElseBody = () => {
  if (Math.random() > 0) return _Promise;else return _Promise;
};
const out1 = ifElseBody().resolve(1);
const tryBody = () => {
  try {
    return _Promise;
  } catch (e) {
    return _Promise;
  }
};
const out2 = tryBody().reject(2);
const forBody = () => {
  for (let i = 0; i < 1; i++) return _Promise;
};
const out3 = forBody().all([]);
const switchBody = () => {
  switch (1) {
    case 1:
      return _Promise;
    default:
      return _Promise;
  }
};
const out4 = switchBody().any([]);
// allowed shape: prefix ExpressionStatements + single top-level ReturnStatement.
// receiver IS inlined and the original call IS pushed to sideEffects so emit re-emits it
let calls = 0;
const prefixThenReturn = () => {
  calls++;
  calls++;
  return _Promise;
};
const out5 = (prefixThenReturn(), _Promise$race)([]);
export { out1, out2, out3, out4, out5, calls };