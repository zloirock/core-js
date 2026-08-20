import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
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
// a DEFAULTED value keeps the key-swap instead of extracting: the helper result can be
// defined where the raw read is undefined, so extracting would flip the default's side
const {
  [_Symbol$iterator]: d = null
} = _Iterator;
d;
const {
  [_Symbol$iterator]: {
    bind: bnd
  } = {}
} = _Promise;
bnd;
// a scope-shadowed `Symbol` is the user's own object: its computed key stays a plain
// property read off the anchored constructor - no iterator-helper extraction
{
  const Symbol = {
    iterator: 'own'
  };
  const {
    [Symbol.iterator]: sw
  } = _WeakMap;
  sw;
}
// an SE-BEARING key keeps the key-swap whenever the host anchors, values and defaults
// alike: the effect stays in the kept key, running exactly once off the rebuilt ctor
const {
  [(se2(), _Symbol$iterator)]: e1
} = _Set;
e1;
const {
  [(se3(), _Symbol$iterator)]: e2 = null
} = _WeakMap;
e2;