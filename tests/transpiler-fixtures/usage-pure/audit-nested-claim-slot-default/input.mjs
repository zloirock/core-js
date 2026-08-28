// a DEFAULT between the leaf and the host decides what the claim reads at all, so the dispatch
// folds BOTH arms: the slot's own value when it is defined, the default when it is not - one read
// of the nav, and the default evaluated only where the source evaluates it. the default's own
// SHAPE does not divide this: a receiver-shaped one folds like any other, because mirroring it
// alone polyfills the arm that may never run and leaves the LIVE read raw. what the mirror still
// owns is the default no dispatch can reach - a parameter's, whose live arm is the caller's value
const src = { y: Object.assign([1, [2]], { other: 5 }) };
const list = [3];
function raise() { return [4]; }
const callDefault = (function () {
  const { y: { at } = raise() } = src;
  return at;
})();
const receiverDefault = (function () {
  const { y: { flat } = list } = src;
  return flat;
})();
// ... and a default on the CLAIM itself folds the same way once the leaf flattens: the dispatcher
// answers `it.method` verbatim off a surface that is not the polyfilled one, so it may be undefined
// and the source's default has to fire
const claimDefault = (function () {
  const { y: { at = null, other } } = src;
  return [at, other];
})();
export { callDefault, receiverDefault, claimDefault };
