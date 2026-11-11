// Transparent type wrappers keep the same subclass receiver.
class Bag extends (Array as typeof Array) {}
export const result = ((Bag as typeof Bag)!).of(3) instanceof Bag;
