import 'core-js/full/array/filter-reject';
import 'core-js/full/array/unique-by';
import 'core-js/full/set/from';
import 'core-js/full/string/cooked';

// These proposals don't exist natively — they MUST come from core-js
export const results = {
  filterReject: [1, 2, 3, 4].filterReject(x => x % 2),
  uniqueBy: [1, 2, 3, 2, 1].uniqueBy(),
  setFrom: Set.from([1, 2, 3]).size,
  cooked: String.cooked`hello`,
};
