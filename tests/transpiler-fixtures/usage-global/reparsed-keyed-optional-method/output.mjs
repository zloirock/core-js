import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
import "core-js/modules/es.number.to-fixed";
// A returned array retains its method type across a computed optional call and reparse.
function get(value) {
  observe();
  return value;
}
export const array = get([7])[key(), 'at']?.(0).toFixed(1);