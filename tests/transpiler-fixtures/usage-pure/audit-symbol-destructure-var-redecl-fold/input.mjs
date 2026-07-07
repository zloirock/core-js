// a bare same-name `var` redeclaration writes NO value, but the scope trackers record a
// phantom violation for it in parser-specific shapes (babel: the valueless declarator;
// estree: the redeclared identifier). the phantom must not poison the Symbol destructure
// alias - the extract folds and the use reads the well-known symbol on BOTH emitters
var { iterator } = Symbol;
var iterator;
export const viaRedecl = [][iterator];

// the plain `var` form exercises the recompute path: the binding's own rewritten declarator
// must not count as a reassignment of itself
var { asyncIterator } = Symbol;
export const viaPlainVar = [][asyncIterator];

// the ASSIGNMENT form folds on both emitters: the binding's only write IS the aliasing
// destructure (babel folds via its in-place hint; the shared predicate carries the
// mutation-free side)
var assigned;
({ iterator: assigned } = Symbol);
export const viaAssignForm = [][assigned];

let assignedLet;
({ asyncIterator: assignedLet } = Symbol);
export const viaAssignLet = [][assignedLet];

// a REPEATED aliasing write keeps the read native on both emitters: the pristine-tree
// judgment refuses the multi-write set, and a lagged re-registration (babel's scope after
// the first in-place rewrite hides the sibling write) cannot resurrect the fold source
let twice;
({ iterator: twice } = Symbol);
({ iterator: twice } = Symbol);
export const viaDoubleAssign = [][twice];

// UNCONDITIONAL nested-block writes fold on both emitters: a labeled block, a finally
// and a for-init always execute; the estree side resolves them through the synthetic
// var-hoist binding (labeled / finally) and past the loop-reinit self record (for-init)
labeled: { var { iterator: viaLabel } = Symbol; }
export const viaLabeledBlock = [][viaLabel];

function throughFinally() {
  try { throughFinally.touched = true; } finally { var { asyncIterator: fin } = Symbol; }
  return [][fin];
}
export const viaFinally = throughFinally();

for (var { iterator: forInit } = Symbol; Math.random() > 2;) { break; }
export const viaForInit = [][forInit];

// negatives: a CONDITIONALLY-executed aliasing write (a hoisted declarator in a branch, a
// loop-body declarator, a guarded assignment) registers no fold source - the untaken path
// reads undefined natively and a fold would mask it; the use INSIDE the branch pays the
// same conservative price
function branchDecl(flag) {
  if (flag) { var { iterator } = Symbol; }
  return [][iterator];
}
export const viaBranchDecl = [branchDecl(false), branchDecl(true)];

function branchInsideUse(flag) {
  if (flag) {
    var { asyncIterator } = Symbol;
    return [][asyncIterator];
  }
  return null;
}
export const viaBranchInsideUse = branchInsideUse(true);

function loopDecl() {
  while (Math.random() > 2) { var { iterator } = Symbol; }
  return [][iterator];
}
export const viaLoopDecl = loopDecl();

var guardedAssign;
if (Math.random() > 2) { ({ iterator: guardedAssign } = Symbol); }
export const viaGuardedAssign = [][guardedAssign];
