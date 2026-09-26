// Discarded wrapper slots still evaluate in source order before the property reads.
// Their effects remain in the captured array or lift with a fully consumed wrapper.
const log = [];
const rows = [[1, 2]];
const [, { Array: { prototype: { at: viaSurface } } }] = [log.push('n'), (log.push('e'), globalThis)];
const [, { at: viaMemo, length: memoLength }] = [log.push('m'), rows.flat()];
const [, { Array: { prototype: { at: mixedInstance } }, Object: { keys: mixedStatic }, other }] = [log.push('x'), globalThis];
export const r = [typeof viaSurface, viaMemo(0), memoLength, typeof mixedInstance, typeof mixedStatic, typeof other, log.length];
