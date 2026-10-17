import _at from "@core-js/pure/actual/instance/at";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A changed outer array iterator supplies the parameter's actual receiver.
// Its literal element cannot prove an Array-only instance helper.
Array.prototype[_Symbol$iterator] = function* () {
  yield 'text';
};
function read(_ref, _unused = void 0) {
  let at = _at(_ref);
  return at.call('ok', 0);
}
export const result = read(...[[1]]);