// indexed access into an object-literal type (`T['data']`) where a SETTER is the last declaration
// for the key makes that key an accessor: reading it yields a paired getter's value, or undefined
// when setter-only - either way the earlier data property is SHADOWED and must not be read as the
// stale array. a getter behind the setter is the real read source and still narrows. distinct
// methods trace each line to its import.
declare function pick<T>(obj: T): T["data"];

export const a = pick({ data: [1, 2, 3], set data(v: number[]) {} }).at(0);

export const b = pick({ get data() { return [1, 2, 3]; }, set data(v: number[]) {} }).includes(0);
