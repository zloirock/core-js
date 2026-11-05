import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Map from "@core-js/pure/actual/map";
// A stored literal container stays in the for-init header with its prefix.
// Its native groupBy read retains the full Map entry and function-name inference.
const o = {};
for (let {
  C: {
    groupBy
  }
} = (eff(), o.s = {
  C: _Map
});;) {
  log(_nameMaybeFunction(groupBy));
  break;
}
for (const {
  C: {
    groupBy
  }
} = (eff(), o.s = {
  C: _Map
});;) {
  log(_nameMaybeFunction(groupBy));
  break;
}