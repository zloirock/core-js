// a phase that RELOCATES a range composes its text at once, so a destructure statement nested in
// that range must be rebuilt first - rebuilt afterwards it emits into text the relocation already
// carried away. both relocating hosts are here: a receiver memo over an IIFE receiver, and a catch
// param whose default runs its own destructure
let k = 0;
const src = [1, 2];
export var { [(k++, 'at')]: a, other } = (function () {
  var { flat } = src;
  return [flat];
})();
try {
  risky();
} catch ({ at, code = function () { var { concat } = src; return concat; } }) {
  use(at, code);
}
