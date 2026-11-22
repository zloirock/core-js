let switchArray;
switch (c) { case 1: switchArray = Boolean; break; default: switchArray = Array; }
class OverSwitchArray extends switchArray {
  static go() { return super.of(1); }
}
export { OverSwitchArray };
