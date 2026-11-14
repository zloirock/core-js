import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// The binding store survives receiver narrowing and still runs on the nullish branch.
export function read(choice, effect) {
  const A = choice ? Array : null;
  let held;
  const value = (effect(), held = A)?.from([3]);
  return [value, held];
}