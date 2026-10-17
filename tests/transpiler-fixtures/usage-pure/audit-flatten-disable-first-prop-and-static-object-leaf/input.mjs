// a disable directive on the FIRST nested prop: the enabled sibling still triggers the
// flatten, the disabled leaf stays an unrewritten residual read. same gate for a leaf under a
// const-bound static-object receiver. the opt-out survives into the OUTPUT: the emitters keep
// the user's comment on the residual pattern, so a later pass over the emitted text keeps
// honoring it. A constructor substituted outside the opt-out still carries that static
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
