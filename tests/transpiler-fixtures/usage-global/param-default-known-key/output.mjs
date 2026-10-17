import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A proven non-colliding string key keeps the ordinary default mirror available.
const key = 'length';
export function read({
  at,
  [key]: other
} = [7]) {
  return [at, other];
}