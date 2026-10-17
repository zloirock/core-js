import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// a constructor written through a binding a pattern takes off a container lands in that container, so the
// container handed out hands the written constructor out with it, statics included - through an object
// pattern and through an array pattern
const box = {
  inner: {
    C: 0
  }
};
const {
  inner: alias
} = box;
alias.C = _Map;
install(box);
const list = [{
  C: 1
}];
const [first] = list;
first.C = _Promise;
register(list);