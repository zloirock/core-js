class C { static get M() { return Map; } static set M(value) {} }
use(C.M.groupBy([3], value => value));
