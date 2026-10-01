// Positional assignments retain iteration and complete each target write in source order.
export function read(rows) {
  let value, tail;
  [[{ at: value }], , [{ includes: value }], ...tail] = rows;
  return [value, tail];
}
