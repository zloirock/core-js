import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// An empty literal selecting a logical fallback must retain its falsy value.
// Closed direct and named callers then read methods from the fallback array.
const fallback = [1];
export const direct = ((_ref, _unused = void 0) => {
  let at = _atMaybeArray(_ref);
  return at.call([4], 0);
})('' || fallback);
function read(_ref2, _unused2 = void 0) {
  let includes = _includesMaybeArray(_ref2);
  return includes.call([4], '4');
}
export const named = read('' || [1]);