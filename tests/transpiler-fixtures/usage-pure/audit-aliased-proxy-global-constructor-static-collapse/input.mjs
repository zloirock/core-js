// an aliased proxy-global receiver (`g = globalThis`) whose member is a separately-polyfillable
// constructor static (`Map.groupBy`) must mark the intermediate receiver chain handled, else the
// static rewrite and the inner constructor rewrite queue overlapping transforms and fail to compose
var g = globalThis;
g.Map.groupBy(x);
