import "core-js/modules/es.array.at";
import "core-js/modules/es.array.concat";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/es.math.trunc";
import "core-js/modules/web.self";
// `in` folds to a constant only while its right operand cannot be the undefined that `in` THROWS on.
const src = [3, [1, 2]];
// composition: the fold DISCARDS its operands, replaying only calls and structural effects - so an
// operand carrying an `in` of its own must not be erased, or the inner test's throw goes with it.
// the rows walk the wrap meeting other transforms: a nav inside it, a chained dispatch (whose ref
// memo makes a sibling wrap the arrow body), two wraps in one expression, and a wrap in the TEST
// of another one
export function composedWraps(absent) {
  const arr = absent ? null : src;
  return ['flat' in arr?.slice(globalThis.window?.self.Math.trunc(0.5)), (() => 'at' in arr?.slice().concat([4]))(), ['flat' in arr?.slice(), 'at' in arr?.slice()], 'flat' in ('at' in arr?.slice() ? src.slice() : src)];
}