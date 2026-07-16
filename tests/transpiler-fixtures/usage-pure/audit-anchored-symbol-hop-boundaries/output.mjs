import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// boundaries of the anchored symbol extraction: only the well-known ITERATOR key takes the
// synth route - an asyncIterator sibling keeps its re-keyed binding beside the extraction;
// a non-binding value keeps the whole prop with a polyfilled key; an effectful init folds
// too - its prefix lifts exactly once ahead of the anchored extraction
const a = _getIteratorMethod(_Map);
const {
  [_Symbol$asyncIterator]: b
} = _Map;
a;
b;
const {
  next
} = _getIteratorMethod(_Set);
next;
se();
const c = _getIteratorMethod(_WeakSet);
c;