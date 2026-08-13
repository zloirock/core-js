// a disable directive on the FIRST nested prop: the enabled sibling still triggers the
// flatten, the disabled leaf stays a native residual read. same gate for a leaf under a
// const-bound static-object receiver. the opt-out survives into the OUTPUT: the AST emitter
// keeps the user's comment inside the residual pattern, the text emitter re-states it above
// the rebuilt statement - either way a later pass over the emitted text keeps honoring it
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
