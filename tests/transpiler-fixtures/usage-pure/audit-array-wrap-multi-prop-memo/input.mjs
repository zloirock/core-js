// an untouched leading statement anchors the comments below: every row here is consumed,
// and a removed first statement would carry its leading comment down to the next one
const anchor = [1, 2];
export { anchor };

// a RE-REFERENCEABLE wrapper element needs no memo: each dispatch spells it, and the residual
// - left binding nothing - drops whole (the consumed keys bind through the extractions, so a
// residual re-reading them would fire their getters a second time, which native never does)
const [{ at: at2, keys: keys2 }] = [arr];
export { at2, keys2 };

// SEVERAL claims off an element that CANNOT be re-referenced share one leading ref
const [{ at, keys }] = [c ? arr : other];
export { at, keys };

// ... and a surviving USER binding keeps the residual, reading through that same ref
const [{ at: at3, keys: keys3, other: other3 }] = [c ? arr : o2];
export { at3, keys3, other3 };

// NEGATIVE: a REST sibling gathers what the pattern does not name, so the consumed key stays
// excluded by its sentinel instead of leaving
const [{ at: at4, ...rest }] = [arr];
export { at4, rest };

// NEGATIVE: a BODYLESS control slot has no statement list to plant the memo in - planting it
// would block-wrap the body and re-point the declaration the strategy still reads, so the
// element is spelled raw there
if (cond) var [{ at: at5, keys: keys5 }] = [c ? arr : other];
export { at5, keys5 };
