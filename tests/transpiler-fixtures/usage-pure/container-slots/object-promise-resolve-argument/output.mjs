import _Object$entries from "@core-js/pure/actual/object/entries";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// Promise.resolve receives the container before its nested constructor slot is read.
const escapedThroughPromiseResolve = function () {
  const awaitedBox = {
    k: Object
  };
  void _Promise$resolve(awaitedBox);
  const {
      k: _ref
    } = awaitedBox,
    entries = _ref === Object ? _Object$entries : _ref.entries;
  return entries;
}();
export { escapedThroughPromiseResolve };