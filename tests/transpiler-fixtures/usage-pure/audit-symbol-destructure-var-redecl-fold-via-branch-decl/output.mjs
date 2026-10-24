import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// negatives: a CONDITIONALLY-executed aliasing write (a hoisted declarator in a branch, a
// loop-body declarator, a guarded assignment) registers no fold source - the untaken path
// reads undefined natively and a fold would mask it; the use INSIDE the branch pays the
// same conservative price
var iterator = _Symbol$iterator;
function branchDecl(flag) {
  if (flag) {
    var iterator = _Symbol$iterator;
  }
  return [][iterator];
}
export const viaBranchDecl = [branchDecl(false), branchDecl(true)];