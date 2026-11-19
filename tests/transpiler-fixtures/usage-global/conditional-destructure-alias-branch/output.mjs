import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A BOUND branch name is the value canon's question, not a bail: a const alias of a global resolves to it
// and injects like the bare name, deciding a `||` it is the left of (`A || Iterator` - no `Iterator`
// module); a parameter shadowing the name resolves to no global, and its branch injects nothing.
const P = Promise;
const {
  all: viaAlias
} = cond ? P : Fallback;
const A = Array;
const {
  from: viaLogical
} = A || Iterator;
function shadowed(Map) {
  const {
    groupBy
  } = cond ? Map : Object;
  return groupBy;
}
export { viaAlias, viaLogical, shadowed };