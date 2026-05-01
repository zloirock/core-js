// temporal flow: the write `o.arr = "x"` happens AFTER the final invocation `o.test()`,
// so it can never be observed by any call to `test`. write start position >= latest call
// start position -> filter excludes the write -> candidate union stays Array<Number> ->
// narrow proceeds. without temporal flow, the write would have widened the union and the
// narrow would have collapsed to generic
const o = {
  arr: [1, 2, 3],
  test() {
    return this.arr.at(0);
  }
};
o.test();
o.arr = "x";
