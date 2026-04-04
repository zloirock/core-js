((x) => {
  if (x) return [1, 2, 3];
  return 'hello';
})(true).at(-1);
