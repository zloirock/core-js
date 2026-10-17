import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.values";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.find";
// the straight-line read stays positional: the re-declaration before the read wins outright
function positional() {
  var a = [1, 2];
  {
    var a = [3, 4].values();
  }
  return a.find(Boolean);
}
export const r = [positional()];