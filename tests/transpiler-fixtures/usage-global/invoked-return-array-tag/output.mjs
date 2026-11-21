import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// A receiver invoker pairs the returned value with its original argument.
// A write through that value keeps later reads on the patched static.
const patched = () => 'abc';
function pick(strings, value) {
  return [value];
}
pick`${Array}`[0].from = patched;
export const result = Array.from([1]).at(0);