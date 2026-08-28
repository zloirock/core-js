// every route that MOVES a claim's receiver read has to carry the receiver's TYPE with it: the
// rewrite hands the claim a minted name or a folded expression, and the type ladder cannot walk
// either back to the value the source named. one row per such route, each with its OWN receiver -
// a shared one would let any row's escape degrade the others - and `at` throughout, because array
// and string both carry it: a route that dropped the type ships the generic dispatcher here
const flattenMemo = (function () {
  const nb = { y: [1, 2] };
  const { y: { at, other } } = nb;
  return [at, other];
})();
const wrapperElement = (function () {
  const nb = { y: 'ab' };
  const [{ y: { at } }] = [nb];
  return at;
})();
const loopHead = (function () {
  const rows = ['ab'];
  let seen;
  for (const { at } of rows) seen = at;
  return seen;
})();
// ... and where the receiver is genuinely UNKNOWN the generic dispatcher IS the answer: the catch
// parameter names a thrown value, and the slot fold takes two arms of different families
const catchParam = (function () {
  try {
    throw { y: 'ab' };
  } catch ({ y: { at } }) {
    return at;
  }
})();
const crossFamilyFold = (function () {
  const nb = { y: [1, 2] };
  const { y: { at, other } = 'ab' } = nb;
  return [at, other];
})();
export { flattenMemo, wrapperElement, loopHead, catchParam, crossFamilyFold };
