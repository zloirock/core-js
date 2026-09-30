import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A const-bound computed key reads the array-valued parameter default.
// Pure mirrors its typed helper into the default; supplied arguments retain their own properties.
const KEY = 'at';
export function read({
  [KEY]: at
} = [1, 2]) {
  return at;
}