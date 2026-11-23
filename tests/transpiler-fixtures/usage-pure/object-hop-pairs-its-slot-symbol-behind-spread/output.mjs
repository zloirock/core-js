import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// The spread reads precede the symbol extraction, as they preceded the native pattern read.
function symbolBehindSpread(extra) {
  const aheadSymbol = _getIteratorMethod({
    ...extra,
    w: _globalThis
  }.w);
  return aheadSymbol;
}
const events = [];
const method = symbolBehindSpread({
  get w() {
    _pushMaybeArray(events).call(events, 'spread');
    return null;
  }
});
export default [method, events];