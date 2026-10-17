// Writes inside assignment targets invalidate the returned-argument proof.
// Pure keeps Array and the affected method reads native, while Promise is still substituted.
// Local argument retention does not imply an escape or a whole-family obligation in global.
let x;
// positive controls: non-param write in an LHS default / param read in a key still peel.
// distinct constructors from the bail cells, so a bail regression is visible in the import set
let other = 0;
const okOtherWrite = (arg => {
  ({ x = (other = 1) } = {});
  return arg;
})(Object);
const { groupBy: gb } = okOtherWrite;
export const r4 = gb([5], v => v);
