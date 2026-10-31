import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Only the outer argument list is iterated. An own iterator on its Array receiver
// does not change the value supplied by the pristine outer literal spread.
const value = [1];
value[_Symbol$iterator] = function* () {
  yield 'text';
};
function read(_ref, _unused = void 0) {
  let at = _atMaybeArray(_ref);
  return at.call([7], 0);
}
export const result = read(...[value]);