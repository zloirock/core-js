import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A realm alias keeps the optional window probe; navigation must not erase it.
export function read(choice) {
  const effects = [];
  const first = globalThis;
  const g = first;
  return g?.window?.self.box;
}