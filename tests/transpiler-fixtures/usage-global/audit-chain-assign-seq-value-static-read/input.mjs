// a BARE static read (no claim tail above it) through a chain-assignment whose value carries a
// side-effecting sequence: the value classifies through the sequence like the SE-free spelling,
// so the read injects its family instead of staying a typeless miss. the assignment is kept
// whole, so nothing depends on dropping the effect. one family per row: a sequence WRAPPING the
// navigation, and a navigation ROOTED at the sequence
let q;
const arr = [1];

export const viaSeqWrapped = (q = (Promise.resolve(1), globalThis.self)).Map;
export const viaSeqRooted = (q = (arr.at(0), globalThis).self).Set;
