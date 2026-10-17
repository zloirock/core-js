import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// a symbol-iterator leaf in a buried host folds expression-shaped: the synth assign rides
// the discarded-value slot, reading the iterator method off the anchored constructor
let itF, outSF;
for (const gopn = (itF = _getIteratorMethod(_WeakSet), _Object$getOwnPropertyNames); !outSF;) outSF = gopn;
export const r = [itF, outSF];