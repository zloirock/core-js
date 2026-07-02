function getData(x) {
  if (x) return [1, 2, 3];
  return [4, 5];
}
getData(true).at(-1);
