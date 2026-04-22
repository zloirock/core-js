function run({ [Symbol.iterator]: iter, from } = Array) {
  return from([1, 2, 3]);
}
run();
