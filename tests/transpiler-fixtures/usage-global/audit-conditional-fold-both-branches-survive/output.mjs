import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// Both open branches carry arrays, even though their element types differ.
type Wrap<T> = T extends string ? {
  items: number[];
} : {
  items: string[];
};
export function read<T>(value: Wrap<T>) {
  return value.items.at(0);
}
declare const fixed: Wrap<number>;
fixed.items.flat();