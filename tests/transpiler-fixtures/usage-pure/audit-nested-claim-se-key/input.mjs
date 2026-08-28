// a claim whose own KEY carries an effect is not the nested dispatch's to take: that dispatch
// DISCARDS the prop, and the effect goes with it, where the source runs it between the hop read and
// the bind. the shape goes to its flat twin instead - one memo the dispatch and the residual share,
// the key running in place off that memo - and where no twin is reachable the claim stays native
const log = [];
const box = { get inner() { log.push('hop'); return [1, [2]]; } };
const folded = (function () {
  const { inner: { [(log.push('key'), 'flat')]: m } } = box;
  return [typeof m, log.join()];
})();
// ... under a WRAPPER the twin lives in the literal's ELEMENT and the normalization reaches it, and
// where an effect-bearing NEIGHBOUR element would reorder that read the twin TRAILS the residual
// instead - either way the key runs off the memo, once, between the literal and the bind
const wrapped = (function () {
  const [{ inner: { [(log.push('wkey'), 'flat')]: m } }] = [box];
  return [typeof m, log.join()];
})();
// ... and a SLOT DEFAULT is carried, not mirrored: the twin's receiver folds both arms off one read,
// where a mirror of the default alone polyfills the arm that may never run and leaves the live one
// raw. the key still runs where the source wrote it - off the memo the fold bound
const defaulted = (function () {
  const spare = [3];
  const { inner: { [(log.push('dkey'), 'flat')]: m } = spare } = box;
  return [typeof m, log.join()];
})();
// the TRAILING twin, spelled out: the literal builds whole (`n`), the emptied pattern coerces the
// element, then the hop reads once and the key runs off that memo (`hop`, `ekey`)
const wrappedBesideAnEffect = (function () {
  const [{ inner: { [(log.push('ekey'), 'flat')]: m } }, zn] = [box, log.push('n')];
  return [typeof m, zn, log.join()];
})();
export { folded, wrapped, wrappedBesideAnEffect, defaulted };
