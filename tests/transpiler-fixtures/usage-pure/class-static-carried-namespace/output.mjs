import _Map from "@core-js/pure/actual/map";
// The inherited method already belongs to the full pure namespace.
// Its key effect and class lookup remain in source order.
class Base extends _Map {}
class Bag extends Base {}
export const value = Bag[effect(), "groupBy"]([3], x => x);