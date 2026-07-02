// Local binding `Object` shadows the global, so its `assign` cannot be assumed read-only.
// Classification must fall back to leak whenever the receiver namespace is locally bound.
const Object = { assign: function (target) { return target; } };
const o = {
  arr: [1, 2, 3],
  test() {
    Object.assign(o);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
