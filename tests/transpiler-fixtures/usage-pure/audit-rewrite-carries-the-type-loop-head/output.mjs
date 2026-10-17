import _atMaybeString from "@core-js/pure/actual/string/instance/at";
const loopHead = function () {
  const rows = ['ab'];
  let seen;
  for (const _ref of rows) {
    const at = _atMaybeString(_ref);
    seen = at;
  }
  return seen;
}();
export { loopHead };