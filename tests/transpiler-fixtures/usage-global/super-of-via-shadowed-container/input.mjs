let arraySlot;
switch (c) { case 1: arraySlot = { Base: Boolean }; break; default: arraySlot = { Base: Array }; }
class OverArraySlot extends arraySlot.Base {
  static go() { const arraySlot = { Base: WeakMap }; return [arraySlot, super.of(1)]; }
}
export { OverArraySlot };
