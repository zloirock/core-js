import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
function readBeforeUse() {
  var a = [1, 2];
  {
    var a = 'xy';
  }
  const g = () => a.includes(1);
  return g();
}
export const r = [readBeforeUse()];