import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A keyof access can return either receiver family.
type Shape = {
  text: string;
  items: number[];
};
export function first(value: Shape[keyof Shape]) {
  return value.at(0);
}