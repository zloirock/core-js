import _Object$entries from "@core-js/pure/actual/object/entries";
// An optional read through a known object slot reaches the constructor held there.
const memberOptionalHop = function () {
  const optionalHolder = {
    k: Object
  };
  return _Object$entries({
    b: 2
  });
}();
export { memberOptionalHop };