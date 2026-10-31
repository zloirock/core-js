import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A local key shadows the symbol import and names the array method.
// The source import does not make that local read prior plugin output.
import { default as key } from '@core-js/pure/actual/symbol/async-iterator';
function read() {
  var _ref;
  const key = 'at';
  return _atMaybeArray(_ref = [7]).call(_ref, 0);
}
export const result = read();
export { key };