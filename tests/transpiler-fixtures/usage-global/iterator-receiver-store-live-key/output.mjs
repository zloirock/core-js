import "core-js/modules/es.array.at";
import "core-js/modules/es.array.join";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/web.self";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  globalThis.box = [3, 4];
  Array.prototype.extra = 1;
  const key = ["b", "o", "x"].join("");
  let w;
  return (w = globalThis.window)?.self?.[key].at(0);
}