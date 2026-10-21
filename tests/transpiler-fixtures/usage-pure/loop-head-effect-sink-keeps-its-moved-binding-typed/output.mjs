import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Map from "@core-js/pure/actual/map";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering. Instance claims retain their own receivers.
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