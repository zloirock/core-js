// `Reflect.set(target, key, value, receiver)` 4-arg form: when receiver is supplied, the
// write routes through `target.[[Set]]` but actually lands on receiver (data property
// shadows / setter `this`). target is "consulted" via prototype chain walk but not directly
// mutated. annotation `mutatesArgument: [0, 3]` flags both candidate slots. complement to
// audit-arg-pass-reflect-set-target-leaks (3-arg form, target at index 0): same closure-leak
// outcome, exercises the receiver-at-index-3 branch of the same annotation
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
