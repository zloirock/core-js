import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A dynamic sibling keeps its native key read while a relocated realm head
// still supplies the nested static in realms without the globalThis slot.
export function read(key) {
  for (const {
    globalThis: {
      [key]: value,
      Array: {
        from
      }
    }
  } of [globalThis]) return [value, from];
}