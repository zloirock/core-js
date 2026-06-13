import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// a disable directive on the FIRST nested prop: the enabled sibling still triggers the
// flatten, the disabled leaf stays a native residual read. same gate for a leaf under a
// const-bound static-object receiver
const og = _Object$groupBy;
const {
  // core-js-disable-next-line
  Map: {
    groupBy
  }
} = _globalThis;
const wrapper = {
  a: _Iterator
};
const {
  // core-js-disable-next-line
  a: {
    from
  }
} = wrapper;
console.log(groupBy, og, from);