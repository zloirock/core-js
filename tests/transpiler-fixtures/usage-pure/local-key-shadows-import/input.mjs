// A local key shadows the symbol import and names the array method.
// The source import does not make that local read prior plugin output.
import { default as key } from '@core-js/pure/actual/symbol/async-iterator';
function read() {
  const key = 'at';
  return [7][key](0);
}
export const result = read();
export { key };
