import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A static sibling's receiver mirror preserves the instance claim under the iterator slot.
// The single function leaf dispatches on the iterator value, with one source iterator lookup.
let iteratorReads = 0;
function iterator() {
  return 7;
}
const iteratorKey = _Symbol$iterator;
const previousIterator = _Object$getOwnPropertyDescriptor(Array, iteratorKey);
_Object$defineProperty(Array, iteratorKey, {
  configurable: true,
  get() {
    iteratorReads++;
    return iterator;
  }
});
try {
  const _ref = {
      of: _Array$of,
      [_Symbol$iterator]: _getIteratorMethod(Array)
    },
    {
      of
    } = _ref;
  const name = _nameMaybeFunction(_getIteratorMethod(_ref));
  console.log(of, name, iteratorReads);
} finally {
  if (previousIterator) _Object$defineProperty(Array, iteratorKey, previousIterator);else delete Array[iteratorKey];
}