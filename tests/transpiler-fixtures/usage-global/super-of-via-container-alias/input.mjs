let arraySlot;
switch (c) { case 1: arraySlot = { Base: Boolean }; break; default: arraySlot = { Base: Array }; }
const arrayAlias = arraySlot;
class OverArrayAlias extends arrayAlias.Base {
  static go() { return super.of(1); }
}
export { OverArrayAlias };
