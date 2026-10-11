import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// the realm's own install replaces the slot the NAME `globalThis` reads and no other, so a constructor read off
// another realm name keeps its type and its statics: `at` off the destructured `Array.prototype` injects the array
// method alone, and the default on a realm level is dead text the injection of `Array.from` looks past
window.globalThis = window;
const {
  Array: {
    prototype: {
      at
    }
  }
} = self;
export const last = at.call(list, -1);
export const {
  Array: {
    from
  } = {}
} = self;