import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.values";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.some";
function functionThenBlockVarNested() {
  function a() {}
  function g() {
    return a.some(Boolean);
  }
  {
    var a = [3, 4].values();
  }
  return g();
}
export const r = [functionThenBlockVarNested()];