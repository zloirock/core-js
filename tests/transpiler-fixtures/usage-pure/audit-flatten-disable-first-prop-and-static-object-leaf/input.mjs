// a disable directive on the FIRST nested prop: the enabled sibling still triggers the
// flatten, the disabled leaf stays a native residual read. same gate for a leaf under a
// const-bound static-object receiver
const {
  // core-js-disable-next-line
  Map: { groupBy },
  Object: { groupBy: og },
} = globalThis;
const wrapper = { a: Iterator };
const {
  // core-js-disable-next-line
  a: { from },
} = wrapper;
console.log(groupBy, og, from);
