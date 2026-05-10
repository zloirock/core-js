// subclass via a multi-hop alias chain on the super-class binding; subclass writes
// must reach base flow through every hop, not stop at the immediate alias name
class Base {
  items = [1];
  read() {
    return this.items.at(0);
  }
}
const Mid = Base;
const Outer = Mid;
class Sub extends Outer {
  m() {
    this.items = 'shadow';
  }
}
new Sub().m();
new Base().read();
