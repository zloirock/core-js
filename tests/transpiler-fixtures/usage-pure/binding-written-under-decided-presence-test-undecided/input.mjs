export function undecided() {
  let value = [1];
  if (globalThis.flag) value = 'abc';
  return value.at(0);
}
