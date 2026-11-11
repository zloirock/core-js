// An opaque consumer can read other inherited statics.
class Bag extends Array {}
hand(Bag);
export const value = Bag.of(3);
