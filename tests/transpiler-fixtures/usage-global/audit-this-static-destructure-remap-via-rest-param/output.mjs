import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.of";
// a rest-bearing param default still injects - the read reaches the patched global even
// though pure must bail on this form
class RestParam extends Array {
  static m({
    of,
    ...rest
  } = this) {
    return [of, rest];
  }
}
export const viaRestParam = RestParam.m();