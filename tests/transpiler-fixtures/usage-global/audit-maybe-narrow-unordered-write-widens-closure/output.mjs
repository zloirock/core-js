import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
let viaFunction = [1];
function reassign() {
  viaFunction = 'ab';
}
export const e = viaFunction.at(0);