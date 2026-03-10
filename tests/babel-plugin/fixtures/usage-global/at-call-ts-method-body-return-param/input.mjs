const obj = {
  identity(x) {
    return x;
  }
};
obj.identity([1, 2, 3]).at(-1);
