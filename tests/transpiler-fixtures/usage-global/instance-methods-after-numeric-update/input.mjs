export function updated(value) {
  value++;
  return [value.at, value.flatMap];
}

export function conditional(value, change) {
  if (change) --value;
  return value.includes;
}
