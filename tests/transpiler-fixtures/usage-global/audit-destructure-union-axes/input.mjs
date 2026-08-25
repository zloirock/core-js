// the destructure union enumerates the same reachable receiver x key targets a member access does,
// so it has to ASK the same way: peel the key's sequence tail, anchor the key axis at the usage,
// and enumerate the receiver's writes with the key resolver its sibling passes. each row below
// used to answer differently from its member twin - the import set is the whole lock here
const arr = [1];

// KEY AXIS anchored at the usage: `k` reaches "at" (through `base`) but never "includes", which is
// written into `base` only AFTER the capture
let base = 'at';
let k = 'flat';
if (cond) k = base;
base = 'includes';
const { [k]: viaAlias } = arr;
use(viaAlias);

// the key's SEQUENCE TAIL is what carries the branching key - reading the raw node found no arm
const { [(effect(), cond ? 'flatMap' : 'findLast')]: viaSeqKey } = arr;
use(viaSeqKey);

// the receiver's writes decompose through an ALIASED computed key, so the receiver is provably
// instance-free and only its static rows carry the injection
let holder = null;
const SLOT = 'x';
({ [SLOT]: holder } = { x: Object });
const { entries: viaInstanceFree } = holder;
use(viaInstanceFree);
