import _Array$from from "@core-js/pure/actual/array/from";
import _self from "@core-js/pure/actual/self";
// a partial-consume residual whose proxy-hop chain roots in an SE wrapper keeps the buried
// effect when the hop collapses: the collapse rebuilds the root as a sequence around the
// polyfill binding instead of dropping the prefix with the deleted hop text. the effect runs
// inside the read, before the pattern binds, so the extraction follows the residual
const {
  custom
} = (eff(), _self).Array;
const from = _Array$from;
from([1]);
custom();