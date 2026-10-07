// Each live logical operand keeps its own substitution under a left the build does not serve (`Map`, its
// constructor entry excluded, while `groupBy` keeps its own): a realm member lands on the backed proxy root,
// a constructor operand on its pure constructor. The selection is evaluated once for the polyfilled
// property and the copy of the remaining keys.
const g = globalThis;
const { groupBy, ...others } = globalThis.self.Map || g.self.Set;
groupBy(list, key);
