// catch with mixed Symbol computed keys. only Symbol.iterator was special-cased into
// the catch entries; Symbol.asyncIterator returned early but the standalone
// Symbol-Identifier visitor queued a transform for its MemberExpression range. catch
// param replacement covered that range -> compose throws "could not locate inner
// needle in outer content"
function probe() {
  try {} catch ({ [Symbol.iterator]: it, [Symbol.asyncIterator]: ait }) {
    return [it, ait];
  }
}
export { probe };
