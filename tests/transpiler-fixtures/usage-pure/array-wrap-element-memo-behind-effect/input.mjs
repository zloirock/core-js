// an array-wrapped element several claims read memoizes - but behind an EFFECTFUL predecessor
// nothing may hoist, so the memo takes the SLOT itself: a write the literal performs exactly where
// native evaluates the element, every reader following the declaration. a PURE predecessor keeps
// the leading memo, which is the same question answered the other way
const log = [];
const rows = [[1, 2]];
const [, { at: behindEffect, length: behindLength }] = [log.push('n'), rows.flat()];
const [, { at: behindPure, length: pureLength }] = [rows, rows.flat()];
export const r = [behindEffect(0), behindLength, behindPure(0), pureLength, log.length];
