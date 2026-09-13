import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Capturing an instance leaf keeps outer static siblings live.
// A preceding declarator rewrite must also preserve a queued computed read.
export function captured(effect) {
  let held;
  const [{
    Array: {
      prototype: {
        at
      }
    },
    Object: {
      keys
    },
    other
  }] = [held = (effect(), globalThis)];
  return [at, keys, other, held];
}
export function following(effect) {
  const {
      Array: {
        from
      }
    } = globalThis,
    {
      [(effect(), 'flat')]: flat
    } = Array.prototype;
  return [from, flat];
}