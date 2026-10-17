// merely HOLDING an alias writes nothing - the slot keeps its narrow
class AliasedIntact {
  static feed() { return [15, 16]; }
  static read() { return AliasedIntact.feed().includes(15); }
}
const Untouched = AliasedIntact;

export const values = [AliasedIntact.read(), Untouched];
