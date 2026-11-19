import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// The spread reads precede the symbol extraction, as they preceded the native pattern read.
function symbolBehindSpread(extra) {
  const {
    w: {
      [_Symbol$iterator]: _unused
    }
  } = {
    ...extra,
    w: _globalThis
  };
  const aheadSymbol = _getIteratorMethod(_globalThis);
  return aheadSymbol;
}
export default [symbolBehindSpread({})];