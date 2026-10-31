// a callee whose returns DISAGREE on the member's type - a string on one path, an array on the other
// - types it as neither: the dispatch stays generic and usage-global injects the entry of each type
function branching(flag) {
  if (flag) return { arr: 'str' };
  return { arr: [4] };
}
export const viaBranching = branching(true).arr.at(0);
