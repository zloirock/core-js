import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
const forRoot = Map;
export function viaForInitVarShadow() {
  {
    const forRoot = {};
    for (var forHeld = forRoot; false;) break;
  }
  {
    const {
      groupBy
    } = forHeld;
    return groupBy([], v => v);
  }
}