import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Different loop iterations can take opposite arms and share the outer binding.
// Keep both receiver families: the read can observe the previous iteration's array.
export function read(flags) {
  let value = 'ab';
  const result = [];
  for (const flag of flags) {
    if (flag) value = ['a', 'b'];else result.push(value.includes('a,b'));
  }
  return result;
}