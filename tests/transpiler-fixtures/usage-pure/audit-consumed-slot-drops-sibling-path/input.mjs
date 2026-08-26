// the assignment-host slot that DROPS takes its statement with it, and the overwrite lands in the
// same slot - one statement in, one out, so the container-path cache the guard index reads sees an
// unchanged length and the same sampled nodes. the path it hands back for the dropped statement has
// no node left, and reading it as a sibling threw (`Invalid value used as weak map key`) before the
// index learnt to skip it. every claim below resolves through that index - `log` is typed by its
// mutations, so `slice` is only claimable once the preceding statements have been walked
const log = [];
const eff = tag => { log.push(tag); return tag; };
let dropped;
({ Array: { prototype: { copyWithin: dropped } } } = globalThis);
export const out = [typeof dropped, log.slice(), eff('t')];
