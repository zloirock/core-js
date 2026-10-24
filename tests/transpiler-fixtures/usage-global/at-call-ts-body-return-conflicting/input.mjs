function getData(x) {
  if (x) return [1, 2, 3];
  return 'hello';
}
getData(true).at(-1);
