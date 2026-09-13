import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Each literal element supplies its own static; the custom element and head names survive.
export function read() {
  const seen = [];
  for (var {
    from
  } of [Array, {
    from: 'mine'
  }]) seen.push(typeof from);
  for (let {
    from
  } of [{
    from: 'first'
  }, Array]) seen.push(typeof from);
  for (const {
    from
  } of [Array, {
    from: undefined
  }]) seen.push(typeof from);
  return seen;
}