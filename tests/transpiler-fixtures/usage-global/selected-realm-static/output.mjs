import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// An optional environment probe keeps the nullable realm and its static read.
export function read() {
  return (typeof window !== "undefined" ? window : undefined)?.Array.from([3]);
}