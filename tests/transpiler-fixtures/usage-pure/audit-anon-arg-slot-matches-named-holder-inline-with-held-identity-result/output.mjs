import _entries from "@core-js/pure/actual/instance/entries";
import _includes from "@core-js/pure/actual/instance/includes";
export function inlineWithHeldIdentityResult() {
  return Object.freeze({
    entries: [1, 2],
    read() {
      var _ref;
      return _includes(_ref = _entries(this)).call(_ref, 1);
    }
  });
}