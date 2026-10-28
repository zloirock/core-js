import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A selected realm remains the source of a loop-head pattern after native relocation.
// Its static and nested instance reads use the same mirror; a supplied object keeps its own values.
export function read(flag, own) {
  for (const {
    Array: {
      prototype: {
        at
      },
      of
    }
  } of [flag ? globalThis : own]) {
    return [at.call([3, 7], -1), of(5)];
  }
}