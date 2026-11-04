import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
// A served static decides the initializer before its value joins later writes.
export function read(flag) {
  let value = Array.from ? "ab" : ["x"];
  if (flag) value = "cd";
  return value.includes("a");
}