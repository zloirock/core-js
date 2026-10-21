import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A live receiver default retains its native read beside an independently polyfilled instance leaf.
const [{
  isArray
} = Array] = [undefined, [7, 8]];
const at = _atMaybeArray([7, 8]);
export const result = [isArray([]), at.call([7, 8], -1)];