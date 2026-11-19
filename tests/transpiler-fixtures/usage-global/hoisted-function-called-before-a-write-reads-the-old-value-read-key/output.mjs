import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
let key = 'flat';
export const earlyKey = readKey([[1]]);
if (flag) key = 'at';else key = 'at';
export function readKey(list) {
  return list[key](0);
}