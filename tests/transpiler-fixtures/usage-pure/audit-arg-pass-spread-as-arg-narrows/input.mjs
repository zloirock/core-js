// `{ ...o }` copies o's enumerable own props into a NEW object - including the own-this method,
// whose shared body later runs with `this` = the copy (`copy.test()`), a receiver this closure
// does not track. the this-field narrow must bail to the generic helpers. pairs with the
// Math.max(...o) fixture: array / call-argument spread only ITERATES and keeps the narrow
const o = {
  arr: [1, 2, 3],
  test() {
    const copy = { ...o };
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b, copy];
  }
};
o.test();
