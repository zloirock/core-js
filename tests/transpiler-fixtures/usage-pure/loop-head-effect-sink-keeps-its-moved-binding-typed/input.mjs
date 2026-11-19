// A stored literal container stays in the for-init header with its prefix.
// Its native groupBy read retains the full Map entry and function-name inference.
const o = {};
for (let { C: { groupBy } } = (eff(), o.s = { C: Map }); ;) {
  log(groupBy.name);
  break;
}
for (const { C: { groupBy } } = (eff(), o.s = typeof Symbol != 'undefined' ? { C: Map } : 0); ;) {
  log(groupBy.name);
  break;
}
