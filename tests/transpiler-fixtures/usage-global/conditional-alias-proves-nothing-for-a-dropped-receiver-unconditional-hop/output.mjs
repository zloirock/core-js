import "core-js/modules/es.object.values";
import "core-js/modules/es.global-this";
export function unconditionalHop() {
  var G = globalThis;
  const {
    w: {
      Object: {
        values
      }
    }
  } = {
    w: G
  };
  return values({
    b: 2
  });
}