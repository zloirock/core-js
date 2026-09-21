import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A receiver invoker pairs the returned value with its original argument.
// A write through that value keeps later reads on the patched static.
function pick(strings, value) {
  return {
    x: value
  };
}
pick`${Array}`.x.from = patched;
export const result = Array.from([1]);