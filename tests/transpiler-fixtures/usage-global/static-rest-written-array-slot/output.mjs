import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A write to the slot invalidates its original constructor.
const source = [Array];
const custom = () => 9;
source[0] = {
  from: custom,
  extra: 7
};
const [{
  from,
  ...rest
}] = source;
export const result = [from(), rest];