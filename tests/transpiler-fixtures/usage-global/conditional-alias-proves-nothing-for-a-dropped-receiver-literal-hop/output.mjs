import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
export function literalHop(flag) {
  if (flag) {
    var G = globalThis;
  }
  const {
    w: {
      Array: {
        from
      }
    }
  } = {
    w: G
  };
  return from([5]);
}