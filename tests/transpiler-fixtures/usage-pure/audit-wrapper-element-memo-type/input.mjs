// the element of an array wrapper MEMOIZES when its claims cannot re-read it, and the memo takes the
// element's place in the literal - so every claim AFTER the memoizing one asks what the pattern
// reads from and finds a bare `_ref`. the receiver's TYPE has to ride across that swap, or the
// second claim ships the generic dispatcher where the first shipped the narrowed one. `at` is the
// discriminator - it exists on String too, so only a receiver known to be an Array narrows it - and
// it must stand SECOND: the claim that plants the memo still resolves against the live element, so
// a discriminator in first position answers the same either way
// the hop is a getter that RECORDS its reads, which is what forces the memo: a pure accessor the
// emitter may simply re-spell, and then the swap this fixture is about never happens. it is spelled
// as a literal accessor, so the type ladder still walks to the array it returns
const log = [];
const src = {
  get y() { log.push('read'); return [1, [2]]; },
};
// at MODULE level, where the memo and its readers share the scope the receiver is bound in - the
// arm where the swap actually costs the type
const [{ findLast, at }] = [src.y];
// ... and the same through the flatten, which writes the nav into that element itself
const flattened = (function () {
  const [{ y: { findLast, at } }] = [src];
  return [findLast, at];
})();
// ... and where the claims take the leaf WHOLE the emptied pattern goes with them - but only if
// nothing else in it binds: a NEIGHBOUR element of the same wrapper still does, and taking the
// statement would take it too
const besideANeighbour = (function () {
  const [{ y: { findLast, at } }, zn] = [src, 7];
  return [findLast, at, zn];
})();
export { findLast, at, flattened, besideANeighbour, log };
