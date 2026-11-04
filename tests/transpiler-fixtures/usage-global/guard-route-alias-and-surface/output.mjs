import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/web.self";
const realm = globalThis;
export function read(effect) {
  let held;
  return [(held = realm).window.field, (effect(), realm).window.field, window?.self.value.at(0), window?.window.value.at(0)];
}