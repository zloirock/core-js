import "core-js/modules/es.array.at";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/web.self";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  globalThis.box = [3];
  const box = {
    get w() {
      throw new Error("getter");
    },
    set w(value) {
      effects.push("write");
    }
  };
  return (box.w = globalThis.window).self?.[effects.push("key"), "box"].at(0);
}