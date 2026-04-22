import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `T[`foo`]` template-literal type index without interpolations equivalent to `T['foo']`.
// resolver evaluates the template at type-level (single quasi, no expressions) and delegates
// to findTypeMember. interpolation-bearing templates stay unresolved (conservative bail)
interface Shape {
  items: number[];
  name: string;
}
declare const shape: Shape;
const items: Shape[`items`] = shape.items;
const first = _atMaybeArray(items).call(items, 0);
export { first };