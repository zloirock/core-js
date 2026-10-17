import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// An iterator-keyed pattern inside an array reads its captured element once.
// The nested default and following sibling retain their native read order.
export function read(source) {
  const [,] = [source];
  const {} = source;
  const {
    missing = fallback()
  } = _getIteratorMethod(source);
  const {
    tail
  } = source;
  return [missing, tail];
}