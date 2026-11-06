import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Symbol from "@core-js/pure/actual/symbol";
import _URL from "@core-js/pure/actual/url";
// a constructor written through a binding that aliases a member path lands on the slot under that path, so a
// static read back through the path reaches the written constructor's static, and pure takes the entry carrying
// it - through an alias, an alias of it, a chain of such aliases read through the whole path or from the
// chain's middle alias, and onto a slot the literal never spelled
const box = {
  inner: {
    C: Array
  }
};
const alias = box.inner;
alias.C = _Iterator;
export const copied = box.inner.C.from([1]);
const holder = {
  inner: {
    C: Object
  }
};
const first = holder.inner;
const second = first;
second.C = _Map;
export const grouped = holder.inner.C.groupBy([1], x => x);
const nest = {
  inner: {
    deep: {
      C: Array
    }
  }
};
const outer = nest.inner;
const deep = outer.deep;
deep.C = _Promise;
export const settled = nest.inner.deep.C.allSettled([]);
const tree = {
  inner: {
    deep: {
      C: Object
    }
  }
};
const branch = tree.inner;
const leaf = branch.deep;
leaf.C = _Symbol;
export const registered = branch.deep.C.for('a');
const empty = {
  inner: {}
};
const hole = empty.inner;
hole.C = _URL;
export const valid = empty.inner.C.canParse('a:b');