import _Array$of from "@core-js/pure/actual/array/of";
// Transparent type wrappers keep the same subclass receiver.
class Bag extends (Array as typeof Array) {}
export const result = _Array$of.call((Bag as typeof Bag)!, 3) instanceof Bag;