import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// a keyof-self value union is the member values of the type: an optional member contributes
// its undefined to that union on the annotation side (`I[keyof I]`). a `keyof T`-typed key over
// a type-parameter receiver reads a key a subtype may add, so that side stays generic instead
interface I {
  items?: number[];
}
declare const viaAnnotation: I[keyof I];
(viaAnnotation ?? 'fallback').at(0);
export function read<T extends I>(source: T, key: keyof T) {
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  return (source[key] ?? 'fallback').includes('a');
}