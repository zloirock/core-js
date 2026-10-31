let staticField = null;
class WithStatic {
  static held = staticField.copyWithin(0);
}
staticField = [];
export const g = WithStatic;