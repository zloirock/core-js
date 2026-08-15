import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// the optional flag of a PARAMETER lives on the binding, not on its annotation, and
// `Parameters<typeof f>` carries it into the tuple element - both admit undefined on a call
// that omits the argument, so neither may fold to the annotated family alone
declare function take(items?: number[]): void;
declare const slot: Parameters<typeof take>[0];
export function read(items?: number[]) {
  return (items ?? 'fallback').at(0);
}
(slot ?? 'fallback').includes('a');