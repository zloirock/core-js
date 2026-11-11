// A builtin receiver escape keeps its identity through a class alias.
export const result = (() => {
class Base extends Array {} const B = Base; class Bag extends B { read() { return Bag.of(5); } }
const of = B.of; return [new Bag().read()[0], of.call(B, 6)[0]];
})();
