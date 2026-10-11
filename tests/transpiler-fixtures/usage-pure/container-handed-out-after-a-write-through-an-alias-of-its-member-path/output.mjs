import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// a constructor written through a binding that aliases a member path lands in the container the path hangs
// off, so that container handed out hands the written constructor out with it, statics included - through an
// alias and through a selection arm that is the path
const box = {
  inner: {
    C: 0
  }
};
const alias = box.inner;
alias.C = _Map;
install(box);
const holder = {
  inner: {
    C: 1
  }
};
const spare = {
  C: 2
};
const picked = flag ? holder.inner : spare;
picked.C = _Promise;
register(holder);