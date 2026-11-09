function make() { return Map; }
const m = make();
m.groupBy([1], value => value);
function f({ groupBy } = m) { return groupBy; }
