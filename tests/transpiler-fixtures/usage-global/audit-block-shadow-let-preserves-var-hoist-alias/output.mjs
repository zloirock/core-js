import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a nested-block `var M = globalThis` hoists to the function scope; a sibling block's `let M`
// reassignment writes a DISTINCT block-scoped binding, not the hoisted var. the reassignment scan
// must skip the shadowing `let M` rather than count it as a constant violation, so the hoisted
// `globalThis` alias survives and `M.Map.groupBy(...)` injects the group-by polyfill
function outer() {
  {
    var M = globalThis;
  }
  {
    let M = 1;
    M = 2;
  }
  return M.Map.groupBy([], x => x);
}