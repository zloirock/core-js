import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A nullable constructor guards its static call and the continuing member.
export function read(choice) {
  const A = choice ? Array : null;
  return A?.from([3]).length;
}