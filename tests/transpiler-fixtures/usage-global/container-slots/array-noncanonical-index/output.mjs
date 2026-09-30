import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.entries";
import "core-js/modules/web.dom-collections.entries";
// A noncanonical numeric string names an ordinary property rather than an array element.
const nonCanonicalSpelling = function () {
  const {
    '01': {
      entries
    }
  } = [[11]];
  return entries;
}();
export { nonCanonicalSpelling };