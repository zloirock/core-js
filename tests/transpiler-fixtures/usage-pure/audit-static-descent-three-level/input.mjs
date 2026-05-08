// 3-level static descent through `wrapper.a.b.c.Array` lifts the constructor leaf.
// Each instance call must narrow precisely so the body-extract alias registers per call site.
const wrapper = { a: { b: { c: Array } } };
const { a: { b: { c: { from } } } } = wrapper;
const arr = from('xyz');
arr.at(0);
arr.includes('y');
arr.copyWithin(0, 1);
