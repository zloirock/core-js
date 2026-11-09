import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The pattern owns its anchor when its source is a for-of binding.
export const r = [];
for (const realm of [globalThis]) {
  const {
    globalThis: {
      Array: {
        prototype: {
          at,
          includes
        }
      }
    }
  } = realm;
  r.push(typeof at, typeof includes);
}