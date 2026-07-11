import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// boundaries of the anchored symbol extraction: only the well-known ITERATOR key takes the
// synth route - an asyncIterator sibling keeps its re-keyed binding beside the extraction;
// a non-binding value keeps the whole prop with a polyfilled key; an effectful init keeps
// the nested form in place (the anchor reshaping requires an effect-free init)
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
const {
  WeakSet: {
    [_Symbol$iterator]: c
  }
} = (se(), _globalThis);
c;