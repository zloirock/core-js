export function dead() {
  let value = 'abc';
  if (typeof Promise == 'undefined') value = [1];
  return value.includes('b');
}
