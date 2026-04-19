// TS wrapper + alias chain: k2 → k1 → 'at'. peel wrapper, then follow binding-init recursion
const arr = [1, 2, 3];
const k1 = 'at';
const k2 = k1;
arr[(k2) as any](0);
