export function arms() {
  let value;
  if (typeof Promise != 'undefined') {
    value = 'abc';
  } else {
    value = [1];
  }
  return value.concat('d');
}
