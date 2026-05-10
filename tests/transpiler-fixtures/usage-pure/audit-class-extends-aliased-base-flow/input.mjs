// subclass via aliased super-class binding; subclass writes must reach base flow
// or the array-fast-path would mis-narrow base reads after the subclass mutated the field
class Base {
  box = [1];
  first() {
    return this.box.at(0);
  }
}
const Alias = Base;
class Sub extends Alias {
  m() {
    this.box = 's';
  }
}
new Sub().m();
new Base().first();
