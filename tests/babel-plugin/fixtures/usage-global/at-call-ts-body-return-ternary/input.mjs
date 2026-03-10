function getData(x) {
  return x ? [1, 2, 3] : [4, 5];
}
getData(true).at(-1);
