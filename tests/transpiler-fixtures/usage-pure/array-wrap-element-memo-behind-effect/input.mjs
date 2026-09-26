// The wrapper evaluates its elements in order before any property reads.
// A captured element is shared by the extracted method and the native length binding.
const log = [];
const rows = [[1, 2]];
const [, { at: behindEffect, length: behindLength }] = [log.push('n'), rows.flat()];
const [, { at: behindPure, length: pureLength }] = [rows, rows.flat()];
export const r = [behindEffect(0), behindLength, behindPure(0), pureLength, log.length];
