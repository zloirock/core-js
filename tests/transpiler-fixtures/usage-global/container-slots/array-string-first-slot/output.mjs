import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// A canonical string index selects the same array element as its numeric spelling.
const stringSpelling = function () {
  const {
    '0': {
      flat
    }
  } = [[3, [4]]];
  return flat;
}();
export { stringSpelling };