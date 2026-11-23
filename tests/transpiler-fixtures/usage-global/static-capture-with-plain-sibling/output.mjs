import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
export function read(effect) {
  const {
    Array: {
      from,
      [(effect(), 'of')]: of,
      custom: value
    }
  } = globalThis;
  return [from, of, value];
}