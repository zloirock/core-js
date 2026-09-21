import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// The initializer runs before the extracted binding, including its temporal dead zone.
for (const {
  Array: {
    from
  },
  ...rest
} = (observe(() => from), globalThis); keepGoing();) {
  use(from([1]), rest);
}