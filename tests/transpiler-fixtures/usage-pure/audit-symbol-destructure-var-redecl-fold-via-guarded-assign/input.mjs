var guardedAssign;
if (Math.random() > 2) { ({ iterator: guardedAssign } = Symbol); }
export const viaGuardedAssign = [][guardedAssign];
