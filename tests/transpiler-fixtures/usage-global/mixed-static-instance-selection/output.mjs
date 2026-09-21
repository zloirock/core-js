import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
// Every selected receiver keeps its own instance methods beside the constructor arm.
// Unknown arrays and strings both remain possible when no caller type is known.
export function flat(flag, user) {
  const {
    from,
    at
  } = flag ? Array : user;
  return [from, at];
}
export function nested(flag, user) {
  const {
    w: {
      from,
      includes
    }
  } = {
    w: flag ? Array : user
  };
  return [from, includes];
}
export function loop(flag, user) {
  for (const {
    from,
    map
  } of [flag ? Array : user]) return [from, map];
}