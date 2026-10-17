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
export { folded };
