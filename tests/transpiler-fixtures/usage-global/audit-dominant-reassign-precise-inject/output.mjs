import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// usage-global twin of the dominance precision: a fall-through branch reassign and a
// rest-slice element resolve their PRECISE types, so a number receiver injects NOTHING
// (`.at` has no number family - absence is the assertion; both number lines share `.at`
// so a regression on either ADDS an entry) and a proven-Array receiver injects its
// single family only
export function viaDominantNumber(x: unknown) {
  if (typeof x === 'string') {
    x = 5;
  } else throw 0;
  return x.at(0);
}
var rest = 'abc';
{
  var [head, ...rest] = [[1], 2, 3];
}
export const viaSliceNumber = rest[0].at(-1);
export function viaDominantArray(x: string | number[], arr: number[]) {
  if (typeof x !== 'string') {
    return null;
  } else {
    x = arr;
  }
  return x.includes('a');
}