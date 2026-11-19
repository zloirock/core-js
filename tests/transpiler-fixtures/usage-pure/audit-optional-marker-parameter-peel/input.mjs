// the optional flag of a PARAMETER lives on the binding, not on its annotation, and
// `Parameters<typeof f>` carries it into the tuple element - both admit undefined on a call
// that omits the argument, so neither may fold to the annotated family alone
declare function take(items?: number[]): void;
declare const slot: Parameters<typeof take>[0];
export function read(items?: number[]) {
  return (items ?? 'fallback').at(0);
}
// @ts-expect-error a call on a union receiver tsc cannot type is the shape under test
(slot ?? 'fallback').includes('a');
