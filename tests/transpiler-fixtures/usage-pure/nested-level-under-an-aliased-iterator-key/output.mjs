import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A nested level under an iterator key destructures the helper result of the iterator method whatever
// spells the key - an alias, a bracket read off `Symbol`, an alias destructured off it or read through the
// realm. The key folds like the claim's own key, so a shadowed `Symbol`, a rewritten alias and the async
// iterator's key keep the level reading the slot as written.
const it = _Symbol$iterator;
const iterator = _Symbol$iterator;
const realmKey = _Symbol$iterator;
const {
  next
} = _getIteratorMethod(getList());
const {
  length: arity
} = _getIteratorMethod(getText());
const {
  call
} = _getIteratorMethod(getSet());
const name = _nameMaybeFunction(_getIteratorMethod(getMap()));
let written = _Symbol$iterator;
written = 'values';
const {
  [written]: {
    bind
  }
} = getArr();
const asyncKey = _Symbol$asyncIterator;
const {
  [asyncKey]: {
    apply
  }
} = getStream();
function shadowed(Symbol) {
  const key = Symbol.iterator;
  const {
    [key]: {
      toString
    }
  } = getArr();
  return toString;
}
export { next, arity, call, name, bind, apply, shadowed };