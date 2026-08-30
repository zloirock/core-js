// a receiver that SPLITS off its own memo, over a navigation the kept-nav plan already collapses
// to a ponyfill under one probe: the memo must compose with that probe rather than test its own
// result again. left to mint a ref, the split spells a SECOND guard over the guard render builds
// (`null == (null == g.window ? void 0 : _self) ? void 0 : ...`) and drags the collapsed root's
// import back in
let out;
let k;
out = (() => globalThis)().window?.self?.Promise.race.zzz.name;
export const read = out;
export const keyed = (() => globalThis)().window?.self?.Promise[k].at;
