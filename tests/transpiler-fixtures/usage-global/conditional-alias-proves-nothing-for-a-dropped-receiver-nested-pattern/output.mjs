import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// A CONDITIONALLY assigned alias holds the realm only on the paths through its branch: off them the name is the hoisted
// `undefined`, and reading a member off it THROWS.
export function nestedPattern(flag) {
  if (flag) {
    var G = globalThis;
  }
  const {
    Array: {
      from
    }
  } = G;
  return from([2]);
}