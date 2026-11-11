class Base extends Array {}
class Bag extends Base {
  static read() {
    const from = super[(effect(), "from")];
    return from.call(this, [3]);
  }
}
export const result = Bag.read();
