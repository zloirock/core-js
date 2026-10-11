import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// a constructor written through a binding that holds a selection of container names lands in whichever arm
// the selection yields, so an arm handed out hands the written constructor out with it, statics included
const listed = {
  C: 0
};
const other = {
  C: 1
};
const either = flag ? listed : other;
either.C = _Map;
install(listed);
const first = {
  C: 2
};
const second = {
  C: 3
};
const pick = first || second;
pick.C = _Promise;
register(first);