// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering. Instance claims retain their own receivers.
const o = {};
for (let { C: { groupBy } } = (eff(), o.s = { C: Map }); ;) {
  log(groupBy.name);
  break;
}
for (const { C: { groupBy } } = (eff(), o.s = typeof Symbol != 'undefined' ? { C: Map } : 0); ;) {
  log(groupBy.name);
  break;
}
