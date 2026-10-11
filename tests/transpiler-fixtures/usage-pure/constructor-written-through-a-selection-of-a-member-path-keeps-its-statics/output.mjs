import _Iterator from "@core-js/pure/actual/iterator";
import _Symbol from "@core-js/pure/actual/symbol";
// a constructor written through a selection lands on the slot under a member path one of its arms is or
// aliases, so a static read back through the path reaches the written constructor's static, and pure takes the
// entry carrying it
const wrap = {
  inner: {
    C: Object
  }
};
const spare = {
  C: Object
};
const picked = flag ? wrap.inner : spare;
picked.C = _Symbol;
export const registered = wrap.inner.C.for('a');
const box = {
  inner: {
    C: Array
  }
};
const other = {
  C: Object
};
const alias = box.inner;
const either = flag ? alias : other;
either.C = _Iterator;
export const copied = box.inner.C.from([1]);