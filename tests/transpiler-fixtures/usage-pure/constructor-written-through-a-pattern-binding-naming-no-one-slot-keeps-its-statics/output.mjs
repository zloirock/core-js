import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// a binding a pattern takes off a container lands its writes on that container even where the pattern names
// no one slot for it - a default keeps the path, a rest or a key no canon folds stands for some slot under
// the container - so a static read back through the container's path reaches the written constructor's static
const box = {
  inner: {
    C: Array
  }
};
const {
  inner: withDefault = {}
} = box;
withDefault.C = _Iterator;
export const copied = box.inner.C.from([1]);
const holder = {
  inner: {
    C: Object
  }
};
const {
  ...rest
} = holder;
rest.inner.C = _Map;
export const grouped = holder.inner.C.groupBy([1], x => x);
const tree = {
  inner: {
    C: Object
  }
};
const {
  [key]: picked
} = tree;
picked.C = _Promise;
export const settled = tree.inner.C.allSettled([]);