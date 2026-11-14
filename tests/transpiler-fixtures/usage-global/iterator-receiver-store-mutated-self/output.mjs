import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/web.self";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  globalThis.self = choice ? {
    box: [7]
  } : null;
  let w;
  return (w = globalThis.window).self?.box.at(0);
}