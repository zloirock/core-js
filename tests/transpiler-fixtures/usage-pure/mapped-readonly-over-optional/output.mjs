import _at from "@core-js/pure/actual/instance/at";
// A readonly mapping preserves the optional source property. Both fallback families can be observed.
type F<T> = { readonly [K in keyof T]: T[K] };
type Receiver = F<Partial<{
  data: number[];
}>>;
function run(value: Receiver) {
  var _ref;
  return _at(_ref = value.data ?? 'fallback').call(_ref, 0);
}
export const result = [run({}), run({
  data: [7]
})];