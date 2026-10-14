import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A for-of head and a catch parameter take a nested level under an aliased iterator key the way they take
// its dotted spelling: the pattern moves into the body, where the level destructures the helper result of
// the iterator method off the element or the thrown value - a single instance leaf binding its own dispatch.
const it = _Symbol$iterator;
for (const _ref of lists) {
  const {
    next
  } = _getIteratorMethod(_ref);
  use(next);
}
for (const _ref2 of maps) {
  const name = _nameMaybeFunction(_getIteratorMethod(_ref2));
  use(name);
}
try {
  run();
} catch (_ref3) {
  let {
    length
  } = _getIteratorMethod(_ref3);
  use(length);
}