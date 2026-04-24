import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// computed-key destructure in a catch clause: emitCatchClause calls transforms.extractContent
// on the key range - exercises #byRange lookup + splice + rebuildPrefixMax
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