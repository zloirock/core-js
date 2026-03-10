function getData(x) {
  switch (x) {
    case 1: return [1, 2];
    case 2: return [3, 4];
    default: return [5, 6];
  }
}
getData(1).at(-1);
