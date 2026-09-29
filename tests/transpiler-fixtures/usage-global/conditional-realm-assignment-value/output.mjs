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
// A conditional assignment preserves its realm result and binds the pure constructor.
function read(enabled) {
  let C;
  const realm = enabled && ({
    Map: C
  } = globalThis);
  if (!enabled) return [realm, C];
  const {
    groupBy: method = 'fallback'
  } = C;
  return [realm === globalThis, typeof method];
}
export const result = [read(true), read(false)];