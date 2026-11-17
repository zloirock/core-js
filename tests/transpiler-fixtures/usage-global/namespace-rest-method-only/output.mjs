import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// A rest-bearing namespace export keeps its native property reads and public names.
// A leaf asking about the host must not authorize private extraction bindings.
namespace Library {
  export const {
    Array: {
      from
    },
    ...rest
  } = globalThis;
}
export { Library };