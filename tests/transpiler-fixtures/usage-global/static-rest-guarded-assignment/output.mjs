import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
// A guarded nested assignment rejects a missing receiver before binding the static.
// Rest copies the original receiver and excludes the claimed key.
let of, rest;
({
  Array: {
    of,
    ...rest
  }
} = cond && globalThis);
use(of, rest);