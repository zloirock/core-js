import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// a keyof-self value union is the member values of the type: an optional member contributes
// its undefined to that union, on the annotation side (`I[keyof I]`) and on the runtime side
// (a `keyof T`-typed key over a type-parameter receiver) alike
interface I {
  items?: number[];
}
declare const viaAnnotation: I[keyof I];
(viaAnnotation ?? 'fallback').at(0);
export function read<T extends I>(source: T, key: keyof T) {
  return (source[key] ?? 'fallback').includes('a');
}