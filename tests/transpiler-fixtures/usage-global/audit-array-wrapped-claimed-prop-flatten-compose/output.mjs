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
// An array-wrapped pattern combines a static binding, an iterator read and rest.
// Usage-global injects the static and iterator support while retaining the pattern.
// Rest excludes both consumed keys.
const [{
  'from': f,
  [Symbol.iterator]: it,
  ...r
}] = [Array];
f([1]);
it;
r;