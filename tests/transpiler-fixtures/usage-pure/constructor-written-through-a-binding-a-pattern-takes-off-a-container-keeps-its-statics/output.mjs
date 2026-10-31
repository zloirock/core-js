import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Symbol from "@core-js/pure/actual/symbol";
import _URL from "@core-js/pure/actual/url";
// a constructor written through a binding a pattern takes off a container through static keys lands on the
// slot the pattern takes, so a static read back through the container's path reaches the written
// constructor's static: pure takes the entry carrying it and leaves the call off the literal's own value, and
// global loads it - over a renamed key, a shorthand, a nested pattern, a computed literal key, and a member path
const box = {
  inner: {
    C: Array
  }
};
const {
  inner: alias
} = box;
alias.C = _Iterator;
export const copied = box.inner.C.from([1]);
const holder = {
  inner: {
    C: Object
  }
};
const {
  inner
} = holder;
inner.C = _Map;
export const grouped = holder.inner.C.groupBy([1], x => x);
const nest = {
  outer: {
    inner: {
      C: Array
    }
  }
};
const {
  outer: {
    inner: deep
  }
} = nest;
deep.C = _Promise;
export const settled = nest.outer.inner.C.allSettled([]);
const tree = {
  inner: {
    C: Object
  }
};
const {
  ['inner']: leaf
} = tree;
leaf.C = _Symbol;
export const registered = tree.inner.C.for('a');
const root = {
  box: {
    inner: {}
  }
};
const {
  inner: hole
} = root.box;
hole.C = _URL;
export const valid = root.box.inner.C.canParse('a:b');