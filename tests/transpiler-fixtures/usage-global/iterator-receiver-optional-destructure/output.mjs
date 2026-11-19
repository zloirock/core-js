import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/web.self";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  globalThis.box = choice ? {
    list: [3]
  } : null;
  const {
    at
  } = globalThis.self.box?.list ?? [];
  return at.call([3], 0);
}