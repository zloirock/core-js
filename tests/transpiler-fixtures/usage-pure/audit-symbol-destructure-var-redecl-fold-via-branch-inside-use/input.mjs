var { asyncIterator } = Symbol;
function branchInsideUse(flag) {
  if (flag) {
    var { asyncIterator } = Symbol;
    return [][asyncIterator];
  }
  return null;
}
export const viaBranchInsideUse = branchInsideUse(true);
