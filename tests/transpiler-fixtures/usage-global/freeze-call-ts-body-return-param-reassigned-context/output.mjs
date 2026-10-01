function identity(x) {
  x = {};
  return x;
}
Object.freeze(identity(42));