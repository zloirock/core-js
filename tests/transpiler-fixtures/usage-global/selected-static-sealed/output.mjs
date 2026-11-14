import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Parentheses end the optional callee chain; arguments still run before the nullish call throws.
export function read(choice, effect) {
  const A = choice ? Array : null;
  return (A?.from)((effect(), [3]));
}