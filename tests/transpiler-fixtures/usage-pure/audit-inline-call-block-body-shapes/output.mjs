import _Promise$all from "@core-js/pure/actual/promise/all";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _Promise$reject from "@core-js/pure/actual/promise/reject";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
var _ref, _ref2, _ref3;
// Agreeing if/else returns prove one constructor while retaining the original body.
// Try/catch, loops and switch remain unproven - their returns guard each read as candidates -
// and expression prefixes keep their effects.
const ifElseBody = () => {
  if (Math.random() > 0) return _Promise;else return _Promise;
};
const out1 = (ifElseBody(), _Promise$resolve)(1);
const tryBody = () => {
  try {
    return _Promise;
  } catch (e) {
    return _Promise;
  }
};
const out2 = (_ref = tryBody(), _ref === _Promise ? _Promise$reject(2) : _ref.reject(2));
const forBody = () => {
  for (let i = 0; i < 1; i++) return _Promise;
};
const out3 = (_ref2 = forBody(), _ref2 === _Promise ? _Promise$all([]) : _ref2.all([]));
const switchBody = () => {
  switch (1) {
    case 1:
      return _Promise;
    default:
      return _Promise;
  }
};
const out4 = (_ref3 = switchBody(), _ref3 === _Promise ? _Promise$any([]) : _ref3.any([]));
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