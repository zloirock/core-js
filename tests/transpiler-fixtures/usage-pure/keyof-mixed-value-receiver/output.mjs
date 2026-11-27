import _at from "@core-js/pure/actual/instance/at";
// A keyof access can return either receiver family.
type Shape = {
  text: string;
  items: number[];
};
export function first(value: Shape[keyof Shape]) {
  return _at(value).call(value, 0);
}