let B = Iterator;
class FieldOverKeyRead {
  static held = (B = Array);
  [(B = Int16Array, 'b')] = 1;
}
