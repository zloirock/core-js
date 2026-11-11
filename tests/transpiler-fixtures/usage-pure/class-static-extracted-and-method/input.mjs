// A captured inherited builtin does not expose the class to an unknown callee.
export const result = (() => {
class Base extends Array {} class Bag extends Base { static fromBase(xs) { return super.from(xs); } read() { return Bag.of(5); } } const of = Bag.of; return [new Bag().read()[0], of.call(Bag, 6)[0]];
})();
