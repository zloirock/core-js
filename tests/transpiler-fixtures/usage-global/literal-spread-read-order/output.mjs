import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
// Spread getters finish constructing the receiver before the pattern writes a binding.
// The static under the final known slot remains polyfilled beside the spread.
const log = [];
const extra = {
  get value() {
    log.push(typeof from);
    return 7;
  }
};
let from = 'old',
  value;
({
  Array: {
    from
  },
  value
} = {
  ...extra,
  Array
});
export { from, value, log };