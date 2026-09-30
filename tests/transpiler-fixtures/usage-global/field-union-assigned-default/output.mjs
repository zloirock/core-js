import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// An assignment default contributes a family that the source field may never hold.
// Deferred reads must retain the String path selected by that default.
const flag = false;
const box = {
  data: flag ? [10, 20] : undefined
};
let data = Math;
({
  data = '1020'
} = box);
function read() {
  return data.includes('02');
}
export const result = read();