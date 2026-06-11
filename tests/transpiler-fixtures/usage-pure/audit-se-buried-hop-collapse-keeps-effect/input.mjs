// a partial-consume residual whose proxy-hop chain roots in an SE wrapper keeps the buried
// effect when the hop collapses: the collapse rebuilds the root as a sequence around the
// polyfill binding instead of dropping the prefix with the deleted hop text
const { from, custom } = (eff(), globalThis).self.Array;
from([1]);
custom();
