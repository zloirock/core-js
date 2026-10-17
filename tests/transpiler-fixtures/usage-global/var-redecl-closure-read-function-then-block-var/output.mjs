import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.values";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/web.dom-collections.iterator";
// a hoisted FUNCTION redeclared by a block `var` holds two values the same way - the index of an
// owner's writes reads its own body block as the owner's scope, where a top-level `function a` is
// the binding itself and casts no shadow over the `var` redeclaring it
function functionThenBlockVar() {
  function a() {}
  {
    var a = [3, 4].values();
  }
  return a.flatMap(x => [x]);
}
export const r = [functionThenBlockVar()];