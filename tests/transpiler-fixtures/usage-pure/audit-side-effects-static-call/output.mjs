import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Array$from from "@core-js/pure/actual/array/from";
// inline-call binding alias with observable side-effect prefix: replacement of the
// static method must preserve the call (k() runs) by wrapping the polyfill binding in
// a SequenceExpression. distinct static methods per line: Promise.resolve / Array.from
let calls = 0;
const k = () => {
  calls++;
  return _Promise;
};
const m = () => {
  calls++;
  return Array;
};
const a = (k(), _Promise$resolve)(3);
const b = (m(), _Array$from)('hi');