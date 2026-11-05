// Skipped array slots still run their effects before the selected property reads.
// Instance and mixed realm captures keep one element value for their extracted and residual leaves.
const log = [];
const rows = [[1, 2]];
const [, { Array: { prototype: { at: viaSurface } } }] = [log.push('n'), (log.push('e'), globalThis)];
const [, { at: viaMemo, length: memoLength }] = [log.push('m'), rows.flat()];
const [, { Array: { prototype: { at: mixedInstance } }, Object: { keys: mixedStatic }, other }] = [log.push('x'), globalThis];
export const r = [typeof viaSurface, viaMemo(0), memoLength, typeof mixedInstance, typeof mixedStatic, typeof other, log.length];
