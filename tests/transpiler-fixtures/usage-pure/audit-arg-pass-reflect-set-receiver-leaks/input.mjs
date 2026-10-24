// `Reflect.set(target, key, value, receiver)` 4-arg form: the write lands on the receiver slot.
// Both target and receiver positions must be flagged so the alias narrow on `o` drops in either role.
const target = {};
const o = {
  arr: [1, 2, 3],
  test() {
    Reflect.set(target, "x", 1, o);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
