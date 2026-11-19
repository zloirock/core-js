let B = Iterator;
class FieldOverKeyRead {
  static held = (B = Array);
  [(B = Int16Array, 'b')] = 1;
}
export const ofAfter = B.of(1);
