import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// A quiet identity call names the same realm hop as its literal argument.
export function read() {
  const key = value => value;
  return globalThis[key("self")].Array.from([3]);
}