// The array getter and default stay between the surrounding initializers.
export function read(receiver, before, fallback, after) {
  const head = before(), [{ /* First read. */ at = fallback(), other }] = [receiver], tail = after();
  return [head, at, other, tail];
}
