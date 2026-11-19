import "core-js/modules/es.string.repeat";
import "core-js/modules/es.number.to-fixed";
// An own null method keeps the optional call and its continuation guarded.
function get(value) {
  observe();
  return value;
}
export const own = get({
  at: null
})[key(), 'at']?.(arg()).toFixed(1);