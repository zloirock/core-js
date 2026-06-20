import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a binding reassigned through a const-array-init / computed-key destructure, then read in a closure
// the reassignment dominates: only the reaching value's static injects (M / N resolve to Array), and
// the dead init (Map) must NOT leak its own static - the reaching-value walk follows the same canon
let M = Map;
const arr = [Array];
[M] = arr;
const readM = () => {
  M.from([1, 2]);
  M.groupBy?.([], x => x);
};
readM();
let N = Map;
const k = "x";
({
  [k]: N
} = {
  x: Array
});
const readN = () => {
  N.of(1, 2);
  N.groupBy?.([], x => x);
};
readN();