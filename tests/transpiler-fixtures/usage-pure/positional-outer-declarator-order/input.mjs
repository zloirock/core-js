// Native positional reads remain between the surrounding declarator evaluations.
export function read(rows) {
  const beforeInit = before(), [{ first, value: { other, at }, last }] = rows, afterInit = after();
  return [beforeInit, first, other, at, last, afterInit];
}
