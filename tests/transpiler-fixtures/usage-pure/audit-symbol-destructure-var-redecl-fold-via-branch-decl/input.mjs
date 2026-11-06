// negatives: a CONDITIONALLY-executed aliasing write (a hoisted declarator in a branch, a
// loop-body declarator, a guarded assignment) registers no fold source - the untaken path
// reads undefined natively and a fold would mask it; the use INSIDE the branch pays the
// same conservative price
var { iterator } = Symbol;
function branchDecl(flag) {
  if (flag) { var { iterator } = Symbol; }
  return [][iterator];
}
export const viaBranchDecl = [branchDecl(false), branchDecl(true)];
