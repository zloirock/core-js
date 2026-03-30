function getOuter() {
  const inner = { method() { return 'string'; } };
  return [1, 2, 3];
}
getOuter().at(-1);
