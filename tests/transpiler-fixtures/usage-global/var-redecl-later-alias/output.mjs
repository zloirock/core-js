import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A later unconditional var declaration overwrites an earlier conditional alias.
// Its static read follows the later value even when the host binds the first declaration.
export function read(flag) {
  if (flag) {
    var {
      Promise: M
    } = globalThis;
  }
  var {
    Map: M
  } = globalThis;
  return typeof M.groupBy;
}