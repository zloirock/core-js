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
// Ordinary and guarded reads share a synthesized source, but not their cache domain.
function read(flag) {
  const {
    Map: M
  } = globalThis;
  const box = {
    x: flag ? M : Math
  };
  const first = 'groupBy' in box.x;
  let C = M;
  if (flag) C = Math;
  return [first, 'groupBy' in C];
}
export const result = [read(true), read(false)];