import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// The outer iterator read is enabled. Its nested name property stays native.
const {
  // core-js-disable-next-line
  name: result
} = _getIteratorMethod([1]);
export { result };