// `Object.assign(target, o)` mutates only the target slot (per-index granularity: a mutating
// callee doesn't bail every arg), BUT it copies o's enumerable own props - including the own-this
// method - onto the target: the shared method body later runs with `this` = target, whose fields
// this closure does not track. the this-field narrow must bail to the generic helpers
const target = {};
const o = {
  arr: [1, 2, 3],
  test() {
    Object.assign(target, o);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
