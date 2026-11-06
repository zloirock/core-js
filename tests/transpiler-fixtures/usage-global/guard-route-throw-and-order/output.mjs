import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
export function read(arg) {
  const alias = globalThis.window;
  const key = 'Array';
  let held;
  return [(held = globalThis.window?.self)[key].from(arg()), alias.self?.Array.from(arg()), held];
}