// Both open branches carry arrays, even though their element types differ.
type Wrap<T> = T extends string ? { items: number[] } : { items: string[] };
export function read<T>(value: Wrap<T>) {
  return value.items.at(0);
}
declare const fixed: Wrap<number>;
fixed.items.flat();
