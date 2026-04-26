import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// computed-key destructure in a catch clause: the well-known symbol key is preserved
// verbatim in the rebuilt rest pattern so the extracted iterator helper still resolves
// to the same key at runtime
try {
  risky();
} catch (_ref) {
  let iter = _getIteratorMethod(_ref);
  let {
    [_Symbol$iterator]: _unused,
    ...rest
  } = _ref;
  use(iter, rest);
}