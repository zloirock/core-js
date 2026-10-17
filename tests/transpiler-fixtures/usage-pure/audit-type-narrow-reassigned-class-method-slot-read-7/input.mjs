// an ALIAS of the class binding writes the same static slot; the receiver has to be RESOLVED,
// since aliasing is exactly what makes the binding's name set unenumerable
class Aliased {
  static feed() { return [13, 14]; }
  static read() { return Aliased.feed().at(0); }
}
const Alias = Aliased;
Alias.feed = () => "text";
export const values = [Aliased.read()];
