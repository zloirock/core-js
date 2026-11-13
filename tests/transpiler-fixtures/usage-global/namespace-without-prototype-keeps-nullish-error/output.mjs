import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.json.stringify";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A namespace has no prototype; its nested pattern still rejects the absent value.
export function declaration() {
  const {
    Math: {
      trunc,
      prototype: {
        [Symbol.iterator]: iterator
      }
    }
  } = globalThis;
  return [trunc, iterator];
}
export function parameter({
  JSON: {
    stringify,
    prototype: {
      [Symbol.iterator]: iterator
    }
  }
} = globalThis) {
  return [stringify, iterator];
}