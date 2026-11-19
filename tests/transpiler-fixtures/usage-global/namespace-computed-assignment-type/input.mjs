namespace Box {
  const key = 'name';
  let value;
  ({ outer: { [key]: value } } = { outer: { name: 'alice' } });
  value.at(-1);
}
