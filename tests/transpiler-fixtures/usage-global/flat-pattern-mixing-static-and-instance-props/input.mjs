// a flat pattern holding a static beside a prop that resolves as an instance member of the same
// constructor: both kinds must contribute their module, whichever path renders the pattern
const src = Array;
const { of, name } = src;
const { groupBy } = Map;
const { fromEntries } = Object;
console.log(of, name, groupBy, fromEntries);
