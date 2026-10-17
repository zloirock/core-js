import _atMaybeString from "@core-js/pure/actual/string/instance/at";
const wrapperElement = function () {
  const nb = {
    y: 'ab'
  };
  const at = _atMaybeString(nb.y);
  return at;
}();
export { wrapperElement };