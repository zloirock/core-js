import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A TypeScript assertion around an iterator key is the key it wraps: the nested level under it destructures
// the helper result of the iterator method, through an alias or straight off `Symbol`, whatever the
// assertion spells.
const it = _Symbol$iterator;
const {
  next
} = _getIteratorMethod(getList());
const {
  length
} = _getIteratorMethod(getText());
const {
  call
} = _getIteratorMethod(getSet());
const {
  bind
} = _getIteratorMethod(getArr());
const {
  apply
} = _getIteratorMethod(getMap());
export { next, length, call, bind, apply };