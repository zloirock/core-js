import "core-js/modules/es.array.at";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/web.self";
// A lowered optional test preserves the early throw without reading the setter target.
export function read(effects) {
  globalThis.box = [3];
  const target = {
    get value() {
      throw new Error('getter');
    },
    set value(value) {
      effects.push('write');
    }
  };
  let ref;
  return (ref = (target.value = globalThis.window).self) == null ? void 0 : ref[effects.push('key'), 'box'].at(0);
}