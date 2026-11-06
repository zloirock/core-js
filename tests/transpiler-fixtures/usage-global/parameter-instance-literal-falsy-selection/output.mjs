import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
// An empty literal selecting a logical fallback must retain its falsy value.
// Closed direct and named callers then read methods from the fallback array.
const fallback = [1];
export const direct = (({
  at
}) => at.call([4], 0))('' || fallback);
function read({
  includes
}) {
  return includes.call([4], '4');
}
export const named = read('' || [1]);