import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A conditional receiver keeps the instance sibling's original type.
// The constructor arm supplies its static; a user array still needs instance dispatch.
export function read(flag, user) {
  const [{
    from,
    at
  }] = [flag ? Array : user];
  return [from, at];
}