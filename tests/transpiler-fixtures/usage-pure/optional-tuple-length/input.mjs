type Size = (readonly [number, string?])['length'];
type Row = Size extends 1 | 2 ? number[] : string;
export function first(value: Row) { return value.at(0); }
