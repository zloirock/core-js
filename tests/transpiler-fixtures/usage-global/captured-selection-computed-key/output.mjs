import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Receiver effects precede the computed key and write; custom values remain native.
export function read(shim, effect, target) {
  return {
    [(effect(), 'from')]: target.value
  } = (effect(), shim || Array);
}