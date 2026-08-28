// a pattern the SOURCE wrote EMPTY is not the emitter's to drop: nothing consumed it, so its
// initializer is a read the source performs and the declaration still owes - only a pattern this
// pipeline emptied itself leaves with its init
const log = [];
const arr = [3, [1, 2]];
const eff = () => { log.push('e'); return arr; };
const {} = eff(), { at: viaEmptyThenClaim } = eff();
const { at: viaClaimThenEmpty } = eff(), {} = eff();
// ... and the shapes that already agreed: the empty pattern alone, and beside a plain binding
const {} = eff();
const {} = eff(), viaPlainTail = 1;
export { viaEmptyThenClaim, viaClaimThenEmpty, viaPlainTail, log };
