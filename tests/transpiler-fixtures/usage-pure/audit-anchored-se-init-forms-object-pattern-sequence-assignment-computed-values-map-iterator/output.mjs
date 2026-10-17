import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$values from "@core-js/pure/actual/object/values";
// FULL consume with an SE-bearing init folds too: the prefix stays verbatim ahead of the
// synth assign, the dead hop read drops
let itQ, outQ;
for (const vq = (eff(), itQ = _getIteratorMethod(_Map), _Object$values); !outQ;) outQ = vq;
export const r = [itQ, outQ];