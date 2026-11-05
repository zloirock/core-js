import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
import "core-js/modules/es.number.to-fixed";
// The first receiver read supplies the method's type again after print and reparse.
function get(value) {
  observe();
  return value;
}
export const array = get([7])[key(), 'at']?.(0).toFixed(1);
export const own = get({
  at: null
})[key(), 'at']?.(arg()).toFixed(1);