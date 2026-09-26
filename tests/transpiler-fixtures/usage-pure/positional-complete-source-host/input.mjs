// One positional plan retains native iteration and emits all selected reads in source order.
export function nested(rows) {
  const [[{ at }], , [{ includes }], ...tail] = rows;
  return [at, includes, tail];
}
export function header(rows) {
  for (const [{ at }, { includes }] = rows;;) return [at, includes];
}
export function bodyless(rows) {
  if (rows) var [{ at }, { includes }] = rows;
  return [at, includes];
}
