import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
var asyncIterator = _Symbol$asyncIterator;
function branchInsideUse(flag) {
  if (flag) {
    var asyncIterator = _Symbol$asyncIterator;
    return [][asyncIterator];
  }
  return null;
}
export const viaBranchInsideUse = branchInsideUse(true);