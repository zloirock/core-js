import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A sole nested level under an iterator key that runs an effect reads the slot once, after the effect: the
// receiver memoizes and the level destructures the helper result of the iterator method behind the key's
// effect, null-guarded where the receiver may be nullish - on a declaration, a loop head, a catch parameter.
const _ref = [1, 2],
  {
    next
  } = (mark(), _getIteratorMethod(_ref));
const _ref2 = getText(),
  {
    length
  } = null == _ref2 ? _ref2[""] : (mark(), _getIteratorMethod(_ref2));
for (const _ref3 of lists) {
  const {
    call
  } = null == _ref3 ? _ref3[""] : (mark(), _getIteratorMethod(_ref3));
  use(call);
}
try {
  run();
} catch (_ref4) {
  let {
    bind
  } = null == _ref4 ? _ref4[""] : (mark(), _getIteratorMethod(_ref4));
  use(bind);
}
const it = _Symbol$iterator;
const _ref5 = getSet(),
  name = null == _ref5 ? _ref5[""] : (mark(), it, _nameMaybeFunction(_getIteratorMethod(_ref5)));
export { next, length, name };