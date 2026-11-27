// A readonly mapping preserves the optional source property. Both fallback families can be observed.
type F<T> = { readonly [K in keyof T]: T[K] };
type Receiver = F<Partial<{ data: number[] }>>;
function run(value: Receiver) { return (value.data ?? 'fallback').at(0); }
export const result = [run({}), run({ data: [7] })];
