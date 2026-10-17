import _Promise from "@core-js/pure/actual/promise/constructor";
// Writes inside assignment targets invalidate the returned-argument proof.
// Pure keeps Array and the affected method reads native, while Promise is still substituted.
// Local argument retention does not imply an escape or a whole-family obligation in global.
let x;
const viaLhsDefault = (arg => {
  ({
    x = arg = _Promise
  } = {});
  return arg;
})(Array);
const {
  from
} = viaLhsDefault;
export const r1 = from([1, 2]);