// indexed-access type with a template-literal key and NO interpolations: `Shape[`items`]`
// is equivalent to `Shape['items']`, i.e. `number[]`. plugin resolves the key from the
// single template quasi and picks the array-specific polyfill for `.at(0)`.
// Templates with interpolations stay unresolved (conservative bail)
interface Shape {
  items: number[];
  name: string;
}
declare const shape: Shape;
const items: Shape[`items`] = shape.items;
const first = items.at(0);
export { first };
