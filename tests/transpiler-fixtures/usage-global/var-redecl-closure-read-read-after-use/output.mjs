import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A nested-block var redeclaration writes the same function binding. A deferred reader must include the families of every value
// that may reach its call.
function readAfterUse() {
  var a = [1, 2];
  function g() {
    return a.at(0);
  }
  {
    var a = 'xy';
  }
  return g();
}
export const r = [readAfterUse()];