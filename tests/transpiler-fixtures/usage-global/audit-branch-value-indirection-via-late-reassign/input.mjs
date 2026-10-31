// a NON-dominating reassignment keeps the branching init live at the use, so the branch
// statics still inject; only a dominating one bails (see the negatives fixture)
let lateReassigned = globalThis.cond ? Array : Iterator;
if (globalThis.late) lateReassigned = {};
export const viaLateReassign = lateReassigned.from;
