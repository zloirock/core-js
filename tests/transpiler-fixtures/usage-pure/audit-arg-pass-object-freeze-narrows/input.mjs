// `Object.freeze(o)` flips [[Extensible]] and locks property writes but does not change any
// existing property's VALUE. our type tracking models property types, not write capability,
// so freeze is treated as non-mutating: no `mutatesArgument` annotation. classifier returns
// 'trivial', narrowing on `arr` is preserved. same applies to `Object.seal` and
// `Object.preventExtensions` (and their Reflect counterparts) - they restrict future
// mutations but don't invalidate the type of properties already in place
const o = {
  arr: [1, 2, 3],
  test() {
    Object.freeze(o);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
