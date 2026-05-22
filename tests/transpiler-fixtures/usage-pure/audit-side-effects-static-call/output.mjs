import _Array$from from "@core-js/pure/actual/array/from";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// Static method called on the result of a side-effecting arrow (`k().resolve(3)`,
// `m().from('hi')`): the polyfill replacement wraps each binding in a SequenceExpression
// so the arrow still runs (`calls++` observed). Distinct statics per line.
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