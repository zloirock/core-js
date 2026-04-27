import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
// catch with mixed Symbol computed keys. only Symbol.iterator was special-cased into
// the catch entries; Symbol.asyncIterator returned early but the standalone
// Symbol-Identifier visitor queued a transform for its MemberExpression range. catch
// param replacement covered that range -> compose throws "could not locate inner
// needle in outer content"
function probe() {
  try {} catch (_ref) {
    let it = _getIteratorMethod(_ref);
    let {
      [_Symbol$asyncIterator]: ait
    } = _ref;
    return [it, ait];
  }
}
export { probe };