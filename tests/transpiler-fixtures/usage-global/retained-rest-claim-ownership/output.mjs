import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// Exclusions already served by extraction are claimed on the inserted properties.
// The native rest target and its independent computed-key read remain visitable.
let from;
const holder = {};
({
  Array: {
    from,
    ...holder["rest".at(-1)]
  }
} = globalThis);
export { from, holder };