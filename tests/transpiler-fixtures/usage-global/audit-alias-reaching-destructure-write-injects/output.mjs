import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the reaching-value channel surfaces a DESTRUCTURE write's member (`({ Map: M } = globalThis)`
// reaches `globalThis.Map`) like the identifier-assignment form, so a member read between
// writes injects its module; the conditional form reaches through the union the same way
let M;
({
  Map: M
} = globalThis);
M.groupBy([1], x => x);
M = {
  groupBy: () => 'U'
};
function t(c) {
  let P;
  if (c) ({
    Promise: P
  } = globalThis);
  return P.try(() => 1);
}
export const r = t(true);