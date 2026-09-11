// a wrapper slot the pattern DISCARDS still evaluates, and what it runs happens before the element
// the claim reads: that effect lifts ahead of the declaration, in source order, and the slot it
// leaves reads as the elision the pattern already had. the claims then serve as they do without a
// neighbour - a surface read, a memo of the element, a sentinel residual beside a live binding
const log = [];
const rows = [[1, 2]];
const [, { Array: { prototype: { at: viaSurface } } }] = [log.push('n'), (log.push('e'), globalThis)];
const [, { at: viaMemo, length: memoLength }] = [log.push('m'), rows.flat()];
const [, { Array: { prototype: { at: mixedInstance } }, Object: { keys: mixedStatic }, other }] = [log.push('x'), globalThis];
export const r = [typeof viaSurface, viaMemo(0), memoLength, typeof mixedInstance, typeof mixedStatic, typeof other, log.length];
