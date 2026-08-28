import _joinMaybeArray from "@core-js/pure/actual/array/instance/join";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
// array WRAPPERS nest, and every level is the same pairing asked again: the pattern's slot picks
// the literal's element there, so a claim under two wrappers resolves like one under a single
// wrapper. what the row pins is the RECEIVER the dispatch reads: a pairing that dropped a level
// reads the holder (`nb`) where the source reads the hop (`nb.y`), and both spellings are here
const nb = {
  y: [1, 2]
};
const nested = function () {
  const at = _at(nb.y);
  return at;
}();
// ... and the ORDER questions read every level too: a neighbour after the slot at the INNER level
// is evaluated after the slot just like an outer one, so the extraction stays behind the residual
const log = [];
const besideAnInnerEffect = function () {
  const [[{}, zn]] = [[nb, _pushMaybeArray(log).call(log, 'n')]];
  const at = _at(nb.y);
  return [at, zn, _joinMaybeArray(log).call(log)];
}();
export { nested, besideAnInnerEffect };