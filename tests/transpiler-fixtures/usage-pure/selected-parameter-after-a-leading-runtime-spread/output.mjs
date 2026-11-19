import _includes from "@core-js/pure/actual/instance/includes";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A leading spread can supply a parameter even when its source literal is empty.
// The caller's later true does not decide this parameter's receiver selection.
Array.prototype[_Symbol$iterator] = function* () {
  yield false;
};
function read(flag) {
  var _ref;
  return _includes(_ref = flag ? [1] : 'text').call(_ref, 'e');
}
export const result = read(...[], true);