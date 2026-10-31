import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// `in` folds to a constant only while its right operand cannot be the undefined that `in` THROWS on.
const src = [3, [1, 2]];
// the logical operators are NOT symmetric for this question. `&&` yields its LEFT whenever that is
// falsy, and every falsy value is one `in` throws on - so it can hand `in` a bad operand even when
// both sides look like arrays. `||` and `??` yield the left only when it is usable, so only their
// right operand can carry a bad value through. an always-truthy object literal on the left of `&&`
// is the one shape that keeps the fold
export function logicalReceivers(absent) {
  const arr = absent ? null : src;
  return ['flat' in (arr && src.slice()), 'at' in (arr || src.slice()), 'includes' in (arr ?? src.slice()), 'entries' in ([1] && src.slice())];
}