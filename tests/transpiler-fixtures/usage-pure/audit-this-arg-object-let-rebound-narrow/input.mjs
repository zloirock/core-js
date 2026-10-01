// rebinding `let o` to a different literal doesn't mutate the original literal: each
// `this.arr.at(0)` call narrows by its own object's literal init, so the first uses
// array dispatch (`arr: [1, 2, 3]`) and the second uses string dispatch
let o = {
  arr: [1, 2, 3],
  test() {
    return this.arr.at(0);
  }
};
o = {
  arr: "stringified",
  test() {
    return this.arr.at(0);
  }
};
o.test();
