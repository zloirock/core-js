// a loop head whose init runs an effect before the value it stores moves the binding its pattern extracts onto the
// head's own declarator: the binding keeps the static it holds, so an instance read of it dispatches on that type
const o = {};
for (let { C: { groupBy } } = (eff(), o.s = { C: Map }); ;) {
  log(groupBy.name);
  break;
}
for (const { C: { groupBy } } = (eff(), o.s = typeof Symbol != 'undefined' ? { C: Map } : 0); ;) {
  log(groupBy.name);
  break;
}
