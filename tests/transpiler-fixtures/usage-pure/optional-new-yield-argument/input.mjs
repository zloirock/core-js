// A yield inside an optional constructor-producing call must remain lowerable.
export function* read(arr) { return new (arr.flat?.(yield 0))(7); }
